import { useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import { formatDate } from "../../utils/format";

export default function Users() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    adminApi.getUsers().then(setUsers);
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>العملاء</h1>
          <p>كل العملاء المسجلين في المتجر.</p>
        </div>
      </div>

      <div className="card">
        {!users ? (
          <div className="table-empty">جاري التحميل...</div>
        ) : users.length === 0 ? (
          <div className="table-empty">مفيش عملاء مسجلين لسه.</div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد الإلكتروني</th>
                  <th>عدد الطلبات</th>
                  <th>تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.name}</td>
                    <td style={{ direction: "ltr", textAlign: "right" }}>{u.email}</td>
                    <td>{u.ordersCount}</td>
                    <td>{formatDate(u.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
