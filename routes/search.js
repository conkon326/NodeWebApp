// 必要なモジュールや設定のインポート
const MAX_ITEMS_PER_PAGE = require("../config/application.config.js").search.MAX_ITEMS_PER_PAGE;
const router = require("express").Router();
const { MySQLClient, sql } = require("../lib/database/client.js");

/**
 * GETリクエストに対するハンドラ
 * クエリパラメータからページとキーワードを取得し、それに基づいてデータベースから結果を取得して表示する。
 * @param {Object} req - Expressリクエストオブジェクト
 * @param {Object} res - Expressレスポンスオブジェクト
 * @param {Function} next - Expressの次のミドルウェア関数
 */
router.get("/", async (req, res, next) => {
  // クエリパラメータからページとキーワードを取得
  var page = req.query.page ? parseInt(req.query.page) : 1;
  var keyword = req.query.keyword || "";
  var count, results;

  try {
    // キーワードが指定されている場合は、名前にキーワードが含まれるショップの数を取得
    // および該当するショップのリストを取得
    if (keyword) {
      count = (await MySQLClient.executeQuery(
        await sql("COUNT_SHOP_BY_NAME"),
        [`%${keyword}%`]
      ))[0].count;
      results = await MySQLClient.executeQuery(
        await sql("SELECT_SHOP_LIST_BY_NAME"),
        [
          `%${keyword}%`,
          (page - 1) * MAX_ITEMS_PER_PAGE,  // オフセット
          MAX_ITEMS_PER_PAGE                // リミット
        ]
      );
    } else {
      // キーワードが指定されていない場合は、高評価のショップのリストを取得
      count = MAX_ITEMS_PER_PAGE;
      results = await MySQLClient.executeQuery(
        await sql("SELECT_SHOP_HIGH_SCORE_LIST"),
        [MAX_ITEMS_PER_PAGE] // リミット
      );
    }

    // 結果をビューに渡して表示
    res.render("./search/list.ejs", {
      keyword,
      count,
      results,
      pagination: {
        max: Math.ceil(count / MAX_ITEMS_PER_PAGE),
        current: page
      }
    });
  } catch (err) {
    // エラーが発生した場合は、次のミドルウェア関数にエラーを渡す
    next(err);
  }
});

// ルーターを外部のファイルで使用できるようにエクスポート
module.exports = router;
