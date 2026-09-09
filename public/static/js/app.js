// Toggle de checklist sem recarregar a página
document.addEventListener("click", async (e) => {
  const item = e.target.closest(".checklist-item[data-id]");
  if (!item) return;

  const id = item.dataset.id;
  const wasDone = item.classList.contains("done");

  // feedback imediato (otimista)
  item.classList.toggle("done");

  try {
    const resp = await fetch(`/checklist/${id}/toggle`, { method: "POST" });
    const data = await resp.json();
    if (!data.ok) throw new Error("falha");

    // atualiza barra de progresso, se existir na página
    const fill = document.querySelector("[data-progress-fill]");
    const pctLabel = document.querySelector("[data-progress-pct]");
    const countLabel = document.querySelector("[data-progress-count]");
    if (fill) fill.style.width = data.pct + "%";
    if (pctLabel) pctLabel.textContent = data.pct + "%";
    if (countLabel) countLabel.textContent = `${data.concluidos}/${data.total}`;
  } catch (err) {
    // reverte em caso de erro de rede
    item.classList.toggle("done");
  }
});

// Seleção visual dos "pills" de tipo de estudo (radio escondido)
document.addEventListener("change", (e) => {
  if (e.target.matches(".type-pill input[type=radio]")) {
    document.querySelectorAll(".type-pill").forEach((el) => el.classList.remove("selected"));
    e.target.closest(".type-pill").classList.add("selected");
  }
});

// Fecha alertas flash automaticamente
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".flash").forEach((el) => {
    setTimeout(() => {
      el.style.transition = "opacity .4s ease";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 400);
    }, 3500);
  });
});
