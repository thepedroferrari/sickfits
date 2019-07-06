const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { YEAR } = require('../utils')

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
  }
};

module.exports = Mutations;
