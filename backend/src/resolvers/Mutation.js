const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { HOUR, YEAR } = require('../utils')
const { randomBytes } = require('crypto')
const { promisify } = require('util')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    );
    return item;
  },
  updateItem(parent, args, ctx, info) {
    // copy updates
    const updates = { ...args };
    //remove the ID
    delete updates.id;
    // run update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // find the item
    const item = await ctx.db.query.item({ where }, `{ id title}`);
    // check if they own that item, or have the permissions

    // Delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    // normalize emails
    args.email = args.email.toLowerCase()

    // hash pw
    const password = await bcrypt.hash(args.password, 10)

    // create user in the db
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }
      }, info
    })

    // create the JWT for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    // set the JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: YEAR
    })
    // Return the user to the browser
    return user
  },
  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }
    // 2. check if password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid Password')
    }
    // 3. generate the JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: YEAR
    })
    // 5. Return the User
    return user;

  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  },

  async requestReset(parent, { email }, ctx, info) {
    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }
    // 2. Set a reset token and expirity on that user
    const promisifyRandomBytes = promisify(randomBytes)
    const resetToken = (await promisifyRandomBytes(20)).toString('hex')
    const resetTokenExpiry = Date.now() + HOUR
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })
    console.log(res)
    return { message: 'Thanks!' }
    // 3. Email them that reset token
  },

  async resetPassword(
    parent,
    {
      password,
      confirmPassword,
      resetToken,
      resetTokenExpiry,
      permissions }, ctx, info) {
    // 1. Check if passwords match
    if (password !== confirmPassword) {
      throw new Error(`Password "${password}" does not match the confirm password "${confirmPassword}"`)
    }
    // 2. Check if it a legit reset token
    // 3. Check if it is expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - HOUR
      }
    })

    if (!user) {
      throw new Error('this token is either invalid or expired!')
    }
    // 4. hash their new password
    const newPassword = await bcrypt.hash(password, 10)
    // 5. Save the new password to the user and remove old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: {
        email: user.email,
        data: {
          newPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      }
    })
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    // 7. SET JWT Cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: YEAR
    })
    // 8. return the new user
    return updatedUser
  }
};

module.exports = Mutations;
