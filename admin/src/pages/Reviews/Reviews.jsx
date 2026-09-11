import { useEffect, useState } from "react";
import { adminApi } from "../../services/api";

function Stars({ rating }) {
  return (
    <span style={{ color: "var(--accent)", fontSize: 14, letterSpacing: 1 }}>
      {"★".repeat(rating)}
      <span style={{ color: "var(--line-strong)" }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function Reviews() {
  const [data, setData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    adminApi.getReviews().then(setData);
  }, []);

  async function handleDelete() {
    await adminApi.deleteReview(confirmDelete._id);
    setData((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r._id !== confirmDelete._id),
    }));
    setConfirmDelete(null);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>آراء العملاء</h1>
          <p>الريفيوهات اللي العملاء كتبوها في الصفحة الرئيسية للمتجر — احذف أي حاجة غير لائقة.</p>
        </div>
      </div>

      {data && (
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <p className="stat-card__label">متوسط التقييم</p>
            <p className="stat-card__value">{data.stats.average || 0} / 5</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">عدد الريفيوهات</p>
            <p className="stat-card__value">{data.stats.count}</p>
          </div>
        </div>
      )}

      <div className="card">
        {!data ? (
          <div className="table-empty">جاري التحميل...</div>
        ) : data.reviews.length === 0 ? (
          <div className="table-empty">لسه مفيش أي ريفيوهات من العملاء.</div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>التقييم</th>
                  <th>الرأي</th>
                  <th>التاريخ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.reviews.map((r) => (
                  <tr key={r._id}>
                    <td>{r.name}</td>
                    <td><Stars rating={r.rating} /></td>
                    <td style={{ maxWidth: 360 }}>{r.comment}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString("ar-EG")}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(r)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>حذف ريفيو {confirmDelete.name}؟</h3>
            <p style={{ color: "var(--text-mid)", fontSize: 14, marginBottom: 24 }}>
              الإجراء ده مش هينفع يتراجع فيه. الريفيو هيتشال نهائيًا وهيختفي من الصفحة الرئيسية.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>
                نعم، احذف
              </button>
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
