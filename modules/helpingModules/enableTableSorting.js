export default function EnableTableSorting() {
  document.querySelectorAll(".statTable").forEach((table) => {
    const headers = table.querySelectorAll("thead td, thead th");
    headers.forEach((header, columnIndex) => {
      const label = header.textContent.trim();
      if (!label) return;

      header.classList.add("sortableHeader");
      header.tabIndex = 0;
      header.setAttribute("role", "button");
      header.setAttribute("aria-label", `Сортувати за: ${label}`);

      const sortByHeader = () => {
        const currentDirection = header.dataset.sortDirection;
        const direction = currentDirection === "asc" ? "desc" : "asc";
        headers.forEach((otherHeader) => delete otherHeader.dataset.sortDirection);
        header.dataset.sortDirection = direction;

        const tbody = table.tBodies[0];
        if (!tbody) return;

        const rows = [...tbody.rows].map((row, index) => ({
          row,
          index,
          value: row.cells[columnIndex]?.textContent.trim() || "",
        }));

        rows.sort((a, b) => {
          const aNumber = Number(a.value.replace(/[%\s,]/g, ""));
          const bNumber = Number(b.value.replace(/[%\s,]/g, ""));
          const bothNumeric = a.value !== "" && b.value !== "" &&
            Number.isFinite(aNumber) && Number.isFinite(bNumber);
          const comparison = bothNumeric
            ? aNumber - bNumber
            : a.value.localeCompare(b.value, "uk", { numeric: true, sensitivity: "base" });

          return (direction === "asc" ? comparison : -comparison) || a.index - b.index;
        });

        rows.forEach(({ row }) => tbody.append(row));
      };

      header.addEventListener("click", sortByHeader);
      header.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          sortByHeader();
        }
      });
    });
  });
}
