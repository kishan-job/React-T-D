interface Statement {
    id: string | number;
    date: string;
    header: string;
    credit: number;
    debit: number;
}

const API_URL = "http://localhost:3001/statements";

// Helper: Formats YYYY-MM-DD from calendar to DD-Mon-YYYY
function formatDate(dateStr: string): string {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
}

// 1. READ
async function refreshUI(): Promise<void> {
    const response = await fetch(API_URL);
    const data: Statement[] = await response.json();
    
    const tableBody = document.getElementById('stmtBody')!;
    tableBody.innerHTML = "";
    let tCredit = 0, tDebit = 0;

    data.forEach(item => {
        tCredit += item.credit;
        tDebit += item.debit;
        
        const row = document.createElement('tr');
        row.id = `row-${item.id}`;
        row.innerHTML = `
            <td>${item.id}.</td>
            <td>${item.date}</td>
            <td>${item.header}</td>
            <td>${item.credit > 0 ? item.credit.toLocaleString() : ""}</td>
            <td>${item.debit > 0 ? item.debit.toLocaleString() : ""}</td>
            <td>
                <button class="btn btn-link btn-sm text-warning p-0 me-2" onclick="editEntry('${item.id}')">(EDIT)</button>
                <button class="btn btn-link btn-sm text-danger p-0" onclick="deleteEntry('${item.id}')">(REMOVE)</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('totalCredit')!.innerText = tCredit.toLocaleString();
    document.getElementById('totalDebit')!.innerText = tDebit.toLocaleString();
    document.getElementById('netBalance')!.innerText = (tCredit - tDebit).toLocaleString();
}

// 2. CREATE
async function addEntry(): Promise<void> {
    const d = (document.getElementById('inDate') as HTMLInputElement).value;
    const h = (document.getElementById('inHeader') as HTMLInputElement).value;
    const c = Number((document.getElementById('inCredit') as HTMLInputElement).value) || 0;
    const deb = Number((document.getElementById('inDebit') as HTMLInputElement).value) || 0;

    if (!d || !h) return alert("Fill Date and Header");

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formatDate(d), header: h, credit: c, debit: deb })
    });

    refreshUI();
}

// 3. DELETE
async function deleteEntry(id: string | number): Promise<void> {
    if (confirm("Remove this entry?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        refreshUI();
    }
}

// 4. UPDATE (Step 1: Enable Fields)
async function editEntry(id: string | number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`);
    const item: Statement = await res.json();
    const row = document.getElementById(`row-${id}`)!;

    row.innerHTML = `
        <td>${id}</td>
        <td><input type="text" id="editDate-${id}" class="form-control form-control-sm bg-dark text-white" value="${item.date}"></td>
        <td><input type="text" id="editHeader-${id}" class="form-control form-control-sm bg-dark text-white" value="${item.header}"></td>
        <td><input type="number" id="editCredit-${id}" class="form-control form-control-sm bg-dark text-white" value="${item.credit}"></td>
        <td><input type="number" id="editDebit-${id}" class="form-control form-control-sm bg-dark text-white" value="${item.debit}"></td>
        <td>
            <button class="btn btn-link btn-sm text-success p-0 me-2" onclick="saveEntry(${id})">(SAVE)</button>
            <button class="btn btn-link btn-sm text-light p-0" onclick="refreshUI()">(CANCEL)</button>
        </td>
    `;
}

// 5. UPDATE (Step 2: Save to Server)
async function saveEntry(id: string | number): Promise<void> {
    const payload = {
        date: (document.getElementById(`editDate-${id}`) as HTMLInputElement).value,
        header: (document.getElementById(`editHeader-${id}`) as HTMLInputElement).value,
        credit: Number((document.getElementById(`editCredit-${id}`) as HTMLInputElement).value) || 0,
        debit: Number((document.getElementById(`editDebit-${id}`) as HTMLInputElement).value) || 0
    };

    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    refreshUI();
}

// Attach to window for HTML onclick
(window as any).addEntry = addEntry;
(window as any).deleteEntry = deleteEntry;
(window as any).editEntry = editEntry;
(window as any).saveEntry = saveEntry;

refreshUI();