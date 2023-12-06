SELECT
  count(*) As count
FROM
  t_login_history
WHERE
  user_id = ?
  AND login >= ?
  AND status = ?