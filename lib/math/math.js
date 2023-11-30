// round-to モジュールを取り込む
const roundTo = require("round-to");

/**
 * 数値を整形してパディングする関数
 * @param {number} values - 整形する値
 * @returns {string} - 整形された文字列
 */
var padding = function (values) {
  // 数値でない場合はアンダースコアを返す
  if (isNaN(parseFloat(values))) {
    return "_";
  }
  // 数値の場合は round-to モジュールを使用して整形
  return roundTo(values, 2).toPrecision(3);
};

/**
 * 数値を丸める関数
 * @param {number} values - 丸める値
 * @returns {number} - 丸められた数値
 */
var round = function (values) {
  // round-to モジュールを使用して数値を丸める
  return roundTo(values, 2);
};

// 他のファイルでこのモジュールを使用できるようにエクスポートする
module.exports = {
  padding,
  round
};
