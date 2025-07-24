// Listas en español para formato largo
const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const diasSemana = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado"
];

// Utilidad para formatear fecha: "20 Agosto 2025"
function formatearFechaLarga(fecha) {
  const f = new Date(fecha);
  return `${f.getDate()} ${meses[f.getMonth()]} ${f.getFullYear()}`;
}

// Generador del calendario académico
function generarFechasCalendario(inicio, diasSeleccionados, numeroSemanas) {
  let fechas = [];
  let fechaActual = new Date(inicio);
  const totalSemanas = parseInt(numeroSemanas, 10);
  let semanaActual = 1;

  while (semanaActual <= totalSemanas) {
    // Insertar semana libre tras la 8 si corresponde
    if (semanaActual === 9 && totalSemanas > 8) {
      fechaActual.setDate(fechaActual.getDate() + 7);
    }
    // Para cada día seleccionado de la semana
    for (let dia of diasSeleccionados) {
      // Calcular próxima ocurrencia de ese día desde fechaActual
      let f = new Date(fechaActual);
      f.setDate(f.getDate() + ((dia - f.getDay() + 7) % 7));
      // Agregar solo fechas crecientes
      if (fechas.length === 0 || f > fechas[fechas.length - 1].fecha) {
        fechas.push({
          fecha: new Date(f),
          semana: semanaActual,
          diaSemana: diasSemana[f.getDay()],
          tema: '',
          biblio: '',
          entregables: ''
        });
      }
    }
    fechaActual.setDate(fechaActual.getDate() + 7);
    semanaActual++;
  }
  fechas.sort((a, b) => a.fecha - b.fecha);
  return fechas;
}

// Renderizado del calendario
function renderizarCalendario(fechas) {
  const contenedor = document.getElementById('calendario');
  contenedor.innerHTML = "";
  const tabla = document.createElement('table');
  const cabezera = `
    <tr>
      <th>Fecha</th><th>Día</th>
      <th>Tema de trabajo</th>
      <th>Bibliografía</th>
      <th>Entregables</th>
      <th>Editar</th>
    </tr>`;
  tabla.innerHTML = cabezera;

  fechas.forEach((sesion, idx) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${formatearFechaLarga(sesion.fecha)}</td>
      <td>${sesion.diaSemana}</td>
      <td class="editable-cell" data-campo="tema" data-idx="${idx}">${sesion.tema || ''}</td>
      <td class="editable-cell" data-campo="biblio" data-idx="${idx}">${sesion.biblio || ''}</td>
      <td class="editable-cell" data-campo="entregables" data-idx="${idx}">${sesion.entregables || ''}</td>
      <td>
        <button class="edit-btn" data-idx="${idx}" title="Editar">&#9998;</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
  contenedor.appendChild(tabla);
}

// Edición en línea
function habilitarEdicion(fechas) {
  document.getElementById('calendario').addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-btn')) {
      const idx = e.target.dataset.idx;
      editarFila(idx, fechas);
    }
  });
}

// Modal simple para editar campos de una sesión
function editarFila(idx, fechas) {
  const sesion = fechas[idx];
  const modal = document.createElement('div');
  modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.2);display:flex;justify-content:center;align-items:center;z-index:10;";
  modal.innerHTML = `
    <form id="modalForm" style="background:#fff;padding:1.5em;border-radius:8px;max-width:370px;box-shadow:0 1px 10px #888;">
      <h3>Editar sesión: ${formatearFechaLarga(sesion.fecha)} | ${sesion.diaSemana}</h3>
      <label>Tema de trabajo
        <input type="text" name="tema" value="${sesion.tema || ''}">
      </label>
      <label>Bibliografía
        <textarea name="biblio">${sesion.biblio || ''}</textarea>
      </label>
      <label>Entregables
        <textarea name="entregables">${sesion.entregables || ''}</textarea>
      </label>
      <div style="margin-top:1em;text-align:right;">
        <button type="button" id="cancelarBtn">Cancelar</button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#cancelarBtn').onclick = () => document.body.removeChild(modal);

  modal.querySelector('#modalForm').onsubmit = function(ev) {
    ev.preventDefault();
    sesion.tema = this.tema.value;
    sesion.biblio = this.biblio.value;
    sesion.entregables = this.entregables.value;
    document.body.removeChild(modal);
    renderizarCalendario(fechas);
  };
}

// Manejo del formulario y parámetros de curso
document.getElementById('formulario').onsubmit = function(e) {
  e.preventDefault();
  // Captura info del curso
  const codigo = document.getElementById('codigo-curso').value.trim();
  const nombre = document.getElementById('nombre-curso').value.trim();
  const inicio = document.getElementById('fecha-inicio').value;
  const dias = Array.from(document.querySelectorAll('input[name="dias"]:checked'))
                   .map(cb => parseInt(cb.value));
  const semanas = parseInt(document.getElementById('semanas').value);
  
  if (!codigo || !nombre || !inicio || dias.length === 0) {
    alert('Complete todos los campos obligatorios y seleccione al menos un día.');
    return;
  }
  let fechas = generarFechasCalendario(inicio, dias, semanas);
  if (fechas.length === 0) {
    alert('No se pudieron generar sesiones.');
    return;
  }
  // Mostrar encabezado del curso
  const info = `<span>Código: </span>${codigo} &nbsp; | &nbsp; <span>Curso: </span>${nombre}`;
  document.getElementById('info-curso').innerHTML = info;
  document.getElementById('calendario-container').style.display = 'block';
  renderizarCalendario(fechas);
  habilitarEdicion(fechas);
};
