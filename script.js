const form = document.getElementById("ticketForm");
const tableBody = document.querySelector("#ticketTable tbody");

let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const ticket = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    name: name.value,
    email: email.value,
    category: category.value,
    priority: priority.value,
    description: description.value,
    status: "Open"
  };

  tickets.push(ticket);
  localStorage.setItem("tickets", JSON.stringify(tickets));
  form.reset();
  renderTickets();
});

function renderTickets() {
  tableBody.innerHTML = "";
  tickets.forEach(ticket => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${ticket.date}</td>
      <td>${ticket.name}</td>
      <td>${ticket.category}</td>
      <td class="priority-${ticket.priority}">${ticket.priority}</td>
      <td>${ticket.status}</td>
      <td>
        <button onclick="closeTicket(${ticket.id})">Close</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function closeTicket(id) {
  tickets = tickets.map(t =>
    t.id === id ? { ...t, status: "Closed" } : t
  );
  localStorage.setItem("tickets", JSON.stringify(tickets));
  renderTickets();
}

function exportCSV() {
  let csv = "Date,Name,Email,Category,Priority,Status,Description\n";
  tickets.forEach(t => {
    csv += `"${t.date}","${t.name}","${t.email}","${t.category}","${t.priority}","${t.status}","${t.description}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tickets.csv";
  a.click();
}

renderTickets();


console.assert(tickets.length > 0, "No tickets found");
console.assert(
  tickets.every(t => ["Low","Medium","High"].includes(t.priority)),
  "Invalid priority detected"
);
