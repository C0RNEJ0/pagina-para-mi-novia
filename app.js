/* ==========================================================================
   JavaScript de Interactividad: Módulo de Servicios Electrónicos
   Poder Judicial - Tamaulipas
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los elementos del DOM
    const landingView = document.getElementById("landing-view");
    const workspaceView = document.getElementById("workspace-view");
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    const tabPanes = document.querySelectorAll(".tab-pane-custom");
    const mainNavLinks = document.querySelectorAll(".navbar-custom .nav-link");
    
    // ==========================================================================
    // 1. Navegación Principal y Vistas (Landing vs Workspace)
    // ==========================================================================
    
    function showLanding() {
        workspaceView.style.display = "none";
        landingView.style.display = "block";
        window.scrollTo(0, 0);
        
        // Actualizar navbar activa
        mainNavLinks.forEach(link => {
            if (link.getAttribute("href") === "#inicio") {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }
    
    function showWorkspace(targetTabId) {
        landingView.style.display = "none";
        workspaceView.style.display = "block";
        window.scrollTo(0, 0);
        
        // Quitar activa de la navegación general excepto si corresponde
        mainNavLinks.forEach(link => link.classList.remove("active"));
        
        // Activar la pestaña del sidebar correspondiente
        activateTab(targetTabId);
    }
    
    function activateTab(tabId) {
        sidebarLinks.forEach(link => {
            if (link.getAttribute("data-tab") === tabId) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
        
        tabPanes.forEach(pane => {
            if (pane.id === tabId) {
                pane.classList.add("active");
            } else {
                pane.classList.remove("active");
            }
        });
    }
    
    // Conectar botones "Volver al Inicio"
    document.querySelectorAll(".btn-back-home, [href='#inicio']").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            showLanding();
        });
    });
    
    // Conectar links del navbar superior que apuntan a secciones del Workspace
    mainNavLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href.startsWith("#")) {
                e.preventDefault();
                if (href === "#inicio") {
                    showLanding();
                } else if (href === "#tramites") {
                    showWorkspace("promociones-electronicas");
                } else if (href === "#citas") {
                    showWorkspace("citas");
                } else if (href === "#transparencia") {
                    showWorkspace("edictos-enviados");
                } else if (href === "#contacto") {
                    // Desplazar al pie de página si está en la landing
                    if (landingView.style.display !== "none") {
                        document.querySelector("footer").scrollIntoView({ behavior: "smooth" });
                        link.classList.add("active");
                    } else {
                        showLanding();
                        setTimeout(() => {
                            document.querySelector("footer").scrollIntoView({ behavior: "smooth" });
                        }, 200);
                    }
                }
            }
        });
    });
    
    // Conectar tarjetas de servicios de la landing
    document.querySelectorAll("[data-service-target]").forEach(card => {
        card.addEventListener("click", (e) => {
            e.preventDefault();
            const targetTab = card.getAttribute("data-service-target");
            showWorkspace(targetTab);
        });
    });
    
    // Conectar enlaces del Sidebar
    sidebarLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const tabId = link.getAttribute("data-tab");
            activateTab(tabId);
        });
    });
    
    // Terminar Sesión Simulada
    document.querySelector(".btn-logout").addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("¿Está seguro de que desea terminar su sesión actual?")) {
            alert("Sesión finalizada. Redirigiendo al portal de acceso...");
            showLanding();
        }
    });
    
    // ==========================================================================
    // 2. Lógica Específica de NPE y Promociones (Navegación de Fechas)
    // ==========================================================================
    
    // Formato largo de fecha en español
    const diasSemana = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
    const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    
    function formatDateLong(date) {
        const diaSem = diasSemana[date.getDay()];
        const dia = date.getDate();
        const mes = meses[date.getMonth()];
        const anio = date.getFullYear();
        return `${diaSem}, ${dia} DE ${mes} DE ${anio}`;
    }
    
    function formatDateInput(date) {
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const anio = date.getFullYear();
        return `${dia}/${mes}/${anio}`;
    }
    
    function parseDateInput(str) {
        const parts = str.split('/');
        if (parts.length === 3) {
            // dd/mm/yyyy
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date();
    }
    
    // Configurar controladores de fechas para NPE
    setupDatePicker("npe-date-input", "npe-prev-day", "npe-next-day", "npe-date-label", "Notificaciones enviadas del día");
    // Configurar controladores de fechas para Promociones Electrónicas
    setupDatePicker("pe-date-input", "pe-prev-day", "pe-next-day", "pe-date-label", "Promociones Electrónicas del día");
    
    function setupDatePicker(inputId, prevId, nextId, labelId, textPrefix) {
        const input = document.getElementById(inputId);
        const prevBtn = document.getElementById(prevId);
        const nextBtn = document.getElementById(nextId);
        const label = document.getElementById(labelId);
        
        if (!input || !prevBtn || !nextBtn || !label) return;
        
        // Fecha inicial (19/05/2026)
        let currentDate = new Date(2026, 4, 19); // Mayo es 4 (0-indexado)
        
        input.value = formatDateInput(currentDate);
        label.innerHTML = `<strong>${textPrefix} ${formatDateLong(currentDate)}</strong>.`;
        
        prevBtn.addEventListener("click", () => {
            currentDate.setDate(currentDate.getDate() - 1);
            input.value = formatDateInput(currentDate);
            label.innerHTML = `<strong>${textPrefix} ${formatDateLong(currentDate)}</strong>.`;
            simulateEmptyTableSearch(inputId);
        });
        
        nextBtn.addEventListener("click", () => {
            currentDate.setDate(currentDate.getDate() + 1);
            input.value = formatDateInput(currentDate);
            label.innerHTML = `<strong>${textPrefix} ${formatDateLong(currentDate)}</strong>.`;
            simulateEmptyTableSearch(inputId);
        });
        
        input.addEventListener("change", () => {
            currentDate = parseDateInput(input.value);
            label.innerHTML = `<strong>${textPrefix} ${formatDateLong(currentDate)}</strong>.`;
            simulateEmptyTableSearch(inputId);
        });
    }
    
    // ==========================================================================
    // 3. Simulaciones e Interacción en Formularios de Búsqueda
    // ==========================================================================
    
    // Simular que el botón "Consultar" o "Buscar" refresca o carga datos vacíos
    function simulateEmptyTableSearch(inputId) {
        // Al cambiar de fecha, simulamos que busca de nuevo y muestra "No hay registros"
        // para dar feedback interactivo realista
        console.log("Cargando datos simulados para la fecha del input: " + inputId);
    }
    
    // Manejar búsquedas de Abogados
    const btnBuscarAbogado = document.getElementById("btn-buscar-abogado");
    const inputBuscarAbogado = document.getElementById("input-buscar-abogado");
    const tablaAbogadosBody = document.querySelector("#tab-abogados-sg table tbody");
    
    if (btnBuscarAbogado && inputBuscarAbogado && tablaAbogadosBody) {
        // Datos de muestra de Abogados
        const abogadosDb = [
            { registro: "10934", nombre: "LIC. CARLOS ALBERTO MARTÍNEZ GÓMEZ", fecha: "12/04/2018", status: "ACTIVO", secretaria: "S.G.A." },
            { registro: "08453", nombre: "DRA. MARÍA ELENA LÓPEZ BUSTAMANTE", fecha: "05/11/2012", status: "ACTIVO", secretaria: "S.G.A." },
            { registro: "14562", nombre: "LIC. JUAN RAMÓN PÉREZ HERNÁNDEZ", fecha: "19/08/2021", status: "INACTIVO", secretaria: "S.G.A." },
            { registro: "16723", nombre: "LIC. SOFÍA VILLARREAL PEÑA", fecha: "30/01/2024", status: "ACTIVO", secretaria: "S.G.A." }
        ];
        
        btnBuscarAbogado.addEventListener("click", (e) => {
            e.preventDefault();
            const query = inputBuscarAbogado.value.trim().toLowerCase();
            if (query === "") {
                alert("Por favor, escriba el nombre o el número de registro a buscar.");
                return;
            }
            
            // Filtrar la BD de muestra
            const resultados = abogadosDb.filter(a => 
                a.nombre.toLowerCase().includes(query) || 
                a.registro.includes(query)
            );
            
            // Vaciar tabla
            tablaAbogadosBody.innerHTML = "";
            
            if (resultados.length === 0) {
                tablaAbogadosBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4 text-muted">
                            <i class="fas fa-search-minus fa-2x mb-2 d-block text-secondary"></i>
                            No se encontraron abogados registrados que coincidan con la búsqueda.
                        </td>
                    </tr>
                `;
            } else {
                resultados.forEach(abogado => {
                    const statusClass = abogado.status === "ACTIVO" ? "status-approved" : "status-rejected";
                    tablaAbogadosBody.innerHTML += `
                        <tr>
                            <td><strong>${abogado.registro}</strong></td>
                            <td>${abogado.nombre}</td>
                            <td>${abogado.fecha}</td>
                            <td><span class="status-badge ${statusClass}">${abogado.status}</span></td>
                            <td>${abogado.secretaria}</td>
                        </tr>
                    `;
                });
            }
        });
    }
    
    // Manejar búsquedas de Autorización de Expedientes (Formulario de Inicio)
    const btnConsultarAutorizar = document.getElementById("btn-consultar-autorizar");
    const inputNumExp = document.getElementById("input-num-exp");
    const inputAnioExp = document.getElementById("input-anio-exp");
    const selectTipoAsunto = document.getElementById("select-tipo-asunto");
    const containerResultadosAutorizar = document.getElementById("container-resultados-autorizar");
    
    if (btnConsultarAutorizar && containerResultadosAutorizar) {
        btnConsultarAutorizar.addEventListener("click", (e) => {
            e.preventDefault();
            const num = inputNumExp.value.trim();
            const anio = inputAnioExp.value.trim();
            
            if (num === "" || anio === "") {
                alert("Por favor ingrese el número y año del expediente.");
                return;
            }
            
            // Mostrar un spinner de carga simulando consulta a base de datos
            containerResultadosAutorizar.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Buscando...</span>
                    </div>
                    <p class="mt-2 text-muted">Consultando registro de expedientes...</p>
                </div>
            `;
            
            setTimeout(() => {
                const tipo = selectTipoAsunto.value;
                // Generar un resultado simulado realista
                containerResultadosAutorizar.innerHTML = `
                    <div class="card border border-success-subtle bg-success-subtle bg-opacity-10 p-3 mt-3">
                        <div class="d-flex align-items-center gap-3">
                            <i class="fas fa-check-circle text-success fa-2x"></i>
                            <div>
                                <h6 class="mb-1 text-success font-weight-bold">Expediente Encontrado</h6>
                                <p class="mb-0 text-dark small">
                                    El <strong>${tipo} ${num}/${anio}</strong> está disponible para autorización electrónica en la materia <strong>CIVIL</strong>.
                                </p>
                            </div>
                            <button class="btn btn-brand-filled btn-sm ms-auto" onclick="alert('Solicitud de autorización enviada con éxito.')">
                                Solicitar Autorización
                            </button>
                        </div>
                    </div>
                `;
            }, 1000);
        });
    }

    // Lógica para subnavegación dentro de CITAS
    const citasNavButtons = document.querySelectorAll(".citas-nav-btn");
    const citasTableTitle = document.getElementById("citas-table-title");
    const citasTableBody = document.querySelector("#tab-citas table tbody");
    
    // Mock database para Citas
    const citasPendientes = [
        { fechaSol: "05/03/2026", fechaAt: "[NO ESPECIFICADO]", folio: "0035531 PENDIENTE", horario: "- -", solicitante: "JUAN PEREZ DEMO", asistente: "JUAN PEREZ DEMO", desc: "EXPEDIENTE: 00149/2011, Materia: Civil Motivo: Recoger copias" },
        { fechaSol: "14/04/2026", fechaAt: "[NO ESPECIFICADO]", folio: "0042509 PENDIENTE", horario: "- -", solicitante: "JUAN PEREZ DEMO", asistente: "JUAN PEREZ DEMO", desc: "EXPEDIENTE: 00149/2011, Materia: Civil Motivo: Presentar pruebas" },
        { fechaSol: "17/05/2026", fechaAt: "[NO ESPECIFICADO]", folio: "0043079 PENDIENTE", horario: "- -", solicitante: "JUAN PEREZ DEMO", asistente: "JUAN PEREZ DEMO", desc: "EXPEDIENTE: 00149/2011, Materia: Civil Motivo: Audiencia de avenencia" }
    ];
    
    const citasAgendadas = [
        { fechaSol: "02/02/2026", fechaAt: "05/02/2026", folio: "0032001 CONFIRMADO", horario: "10:30 AM", solicitante: "MARIA LOPEZ DEMO", asistente: "MARIA LOPEZ DEMO", desc: "EXPEDIENTE: 00234/2019, Materia: Familiar Motivo: Vista de expediente" },
        { fechaSol: "10/03/2026", fechaAt: "12/03/2026", folio: "0036043 CONFIRMADO", horario: "11:15 AM", solicitante: "PEDRO RUIZ DEMO", asistente: "PEDRO RUIZ DEMO", desc: "EXPEDIENTE: 00012/2022, Materia: Mercantil Motivo: Entrega de documentos" }
    ];

    const citasDenegadas = [
        { fechaSol: "20/01/2026", fechaAt: "22/01/2026", folio: "0031120 DENEGADA", horario: "- -", solicitante: "JUAN PEREZ DEMO", asistente: "JUAN PEREZ DEMO", desc: "EXPEDIENTE: 00149/2011, Materia: Civil Motivo: Horario no disponible" }
    ];

    if (citasNavButtons.length > 0 && citasTableBody) {
        citasNavButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                citasNavButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const type = btn.getAttribute("data-citas-type");
                citasTableBody.innerHTML = "";
                
                if (type === "pendientes") {
                    citasTableTitle.textContent = "Ver Citas Pendientes (3)";
                    renderCitasRows(citasPendientes, "status-pending", "PENDIENTE");
                } else if (type === "agendadas") {
                    citasTableTitle.textContent = "Ver Citas Agendadas";
                    renderCitasRows(citasAgendadas, "status-approved", "CONFIRMADA");
                } else if (type === "denegadas") {
                    citasTableTitle.textContent = "Ver Citas Denegadas";
                    renderCitasRows(citasDenegadas, "status-rejected", "RECHAZADA");
                } else if (type === "agendar") {
                    citasTableTitle.textContent = "Agendar Nueva Cita";
                    citasTableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="py-4 px-4">
                                <form id="form-nueva-cita" class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Materia</label>
                                        <select class="form-select"><option>CIVIL</option><option>FAMILIAR</option><option>MERCANTIL</option></select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Juzgado</label>
                                        <select class="form-select"><option>JUZGADO PRIMERO CIVIL (VICTORIA)</option><option>JUZGADO SEGUNDO CIVIL (VICTORIA)</option></select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Número de Expediente</label>
                                        <input type="text" class="form-control" placeholder="Ej. 00149/2011">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Fecha Propuesta</label>
                                        <input type="date" class="form-control">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Horario Deseado</label>
                                        <select class="form-select"><option>09:00 - 09:30 AM</option><option>10:00 - 10:30 AM</option><option>11:30 - 12:00 PM</option></select>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Motivo de la Cita</label>
                                        <textarea class="form-control" rows="2" placeholder="Escriba el motivo detallado de su cita..."></textarea>
                                    </div>
                                    <div class="col-12 text-end">
                                        <button type="submit" class="btn btn-brand-filled btn-sm">Solicitar Agendar Cita</button>
                                    </div>
                                </form>
                            </td>
                        </tr>
                    `;
                    document.getElementById("form-nueva-cita").addEventListener("submit", (e) => {
                        e.preventDefault();
                        alert("Solicitud de cita guardada. Pasará a estado PENDIENTE de confirmación por el juzgado.");
                        // Regresar a pendientes
                        document.querySelector('[data-citas-type="pendientes"]').click();
                    });
                } else if (type === "consultar") {
                    citasTableTitle.textContent = "Consultar Citas por Fecha";
                    citasTableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="py-4 text-center">
                                <div class="d-inline-flex gap-2 align-items-center mb-3">
                                    <label class="form-label mb-0 me-2">Seleccione Fecha:</label>
                                    <input type="date" class="form-control form-control-sm" style="width: auto;">
                                    <button class="btn btn-brand-filled btn-sm" onclick="alert('Buscando citas en el rango seleccionado...')">Buscar</button>
                                </div>
                                <p class="text-muted small">Mostrando resultados históricos del día</p>
                            </td>
                        </tr>
                    `;
                }
            });
        });
    }

    function renderCitasRows(data, statusClass, statusLabel) {
        data.forEach(item => {
            citasTableBody.innerHTML += `
                <tr>
                    <td>${item.fechaSol}</td>
                    <td>${item.fechaAt}</td>
                    <td>
                        <span class="status-badge ${statusClass} d-block text-center font-weight-bold mb-1">${statusLabel}</span>
                        <small class="text-secondary d-block text-center">${item.folio.split(' ')[0]}</small>
                    </td>
                    <td><strong>${item.horario}</strong></td>
                    <td>
                        <span class="d-block small"><strong>Solicitante:</strong> ${item.solicitante}</span>
                        <span class="d-block small text-muted"><strong>Asistente:</strong> ${item.asistente}</span>
                    </td>
                    <td><div style="max-width: 250px; font-size: 0.85rem;">${item.desc}</div></td>
                    <td class="text-center">
                        <button class="btn btn-outline-secondary btn-sm p-1 px-2" title="Ver / Imprimir Folio" onclick="alert('Generando ticket de cita en PDF...')">
                            <i class="fas fa-print"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    // Tabla general de búsqueda y filtrado interactivo
    document.querySelectorAll(".table-search-input").forEach(searchField => {
        searchField.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const targetTableId = searchField.getAttribute("data-target-table");
            const rows = document.querySelectorAll(`#${targetTableId} tbody tr`);
            
            rows.forEach(row => {
                if (row.cells.length === 1 && row.cells[0].getAttribute("colspan")) {
                    // Ignorar la fila "No hay registros" de búsqueda
                    return;
                }
                const text = row.textContent.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    });
});
