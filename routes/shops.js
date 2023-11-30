const router = require("express").Router();
const { MySQLClient, sql } = require("../lib/database/client.js");

/**
 * ショップ詳細を取得して表示するエンドポイント
 * @param {Object} req - Expressリクエストオブジェクト
 * @param {Object} res - Expressレスポンスオブジェクト
 * @param {Function} next - Express next関数
 */
router.get("/:id", async (req, res, next) => {
  // リクエストパラメータからIDを取得
  var id = req.params.id;

  try {
    // MySQLクエリを非同期で実行し、結果を待つ
    const result = await Promise.all([
      MySQLClient.executeQuery(
        await sql("SELECT_SHOP_DETAIL_BY_ID"),
        [id]
      )
    ]);

    // 実行結果からデータを取得
    var data = result[0][0];

    // レンダリングしてクライアントにデータを送信
    res.render("./shops/index.ejs", data);
  } catch (err) {
    // エラーが発生した場合は次のミドルウェアにエラーを渡す
    next(err);
  }
});

// ルーターをエクスポート
module.exports = router;
