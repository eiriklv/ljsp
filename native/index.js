var SpecialForm = require('./special-form'),
    eval = require('../eval'),
    util = require('../util');

var native = {
  print: console.log.bind(console),
  def: SpecialForm(function(name, value) {
    return this[name] = value;
  }),
  fn: SpecialForm(function(defArgs, expr) {
    return function() {
      var callArgs = arguments,
          childScope = Object.create(this);

      defArgs.forEach(function(argName, index) {
        childScope[argName] = callArgs[index];
      });

      return eval(expr, childScope);
    }
  }),
  defn: SpecialForm(function(name, args, expr) {
    var fn = native.fn.call(this, args, expr);
    return native.def.call(this, name, fn);
  }),
  'do': SpecialForm(function() {
    var exprs = util.toArray(arguments),
        scope = this;

    return exprs.reduce(function(_, expr) {
      return eval(expr, scope);
    }, null);
  }),
  'if': SpecialForm(function(condition, trueExpr, falseExpr) {
    var passed = eval(condition, this);
    return eval(passed ? trueExpr : falseExpr, this);
  })
};

module.exports = util.mixinMany(native, [
  require('./math'),
  require('./logic')
]);
