const { forwardTo } = require("prisma-binding");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  users: forwardTo("db"),
  itemsConnection: forwardTo("db"),

  /* async items(parent, args, ctx, info) {
    const items = await ctx.db.query.items();
    return items
  },

  async users(parent, args, ctx, info) {
    const users = await ctx.db.query.users();
    return users
  } */
};

module.exports = Query;
