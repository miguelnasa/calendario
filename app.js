// Días en español
const diasSemana = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado"
];

// Utilidad: formatear fecha
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

// Generador del calendario
function generarFechasCalendario(inicio, diasSeleccionados, numeroSemanas) {
  let fechas = [];
  let fechaActual = new Date(inicio);
  let totalSemanas = parseInt(numeroSemanas, 10);
  let semanaActual = 1;
  let sesionesPorSemana = diasSeleccionados.length;

  while (semanaActual <= totalSemanas) {
    // Semana de receso tras la semana 8, si procede
    if (semanaActual === 9 && totalSemanas > 8) {
      // Omitir una semana
      fechaActual.setDate(fechaActual.getDate() + 7);
    }
    // Generar días de la semana seleccionados
    for (let dia of diasSeleccionados) {
      // Buscar el próximo día correcto desde fechaActual:
      let f = new Date(fechaActual);
      f.setDate(f.getDate() + ((dia - f.getDay() + 7) % 7));
      // Solo agregar si corresponde a la semana actual y no está duplicado
      if (fechas.length === 0 ||
          f > fechas[fechas.length - 1].fecha) {
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
    // Mover al siguiente bloque semanal
    fechaActual.setDate(fechaActual.getDate() + 7);
    semanaActual++;
  }
  // Ordenar por fecha
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
      <td>${formatearFecha(sesion.fecha)}</td>
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

// Edición en línea de celdas
function habilitarEdicion(fechas) {
  document.getElementById('calendario').addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-btn')) {
      const idx = e.target.dataset.idx;
      editarFila(idx, fechas);
    }
  });
}

// Modal de edición sencilla (sin usar librerías externas)
function editarFila(idx, fechas) {
  const sesion = fechas[idx];
  const modal = document.createElement('div');
  modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.2);display:flex;justify-content:center;align-items:center;z-index:10;";
  modal.innerHTML = `
    <form id="modalForm" style="background:#fff;padding:1.5em;border-radius:8px;max-width:370px;box-shadow:0 1px 10px #888;">
      <h3>Editar sesión: ${formatearFecha(sesion.fecha)} | ${sesion.diaSemana}</h3>
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

// Manejo del formulario
document.getElementById('formulario').onsubmit = function(e) {
  e.preventDefault();
  const inicio = document.getElementById('fecha-inicio').value;
  const dias = Array.from(document.querySelectorAll('input[name="dias"]:checked'))
                   .map(cb => parseInt(cb.value));
  const semanas = parseInt(document.getElementById('semanas').value);
  if (!inicio || dias.length === 0) {
    alert('Seleccione la fecha de inicio y al menos un día de la semana.');
    return;
  }
  let fechas = generarFechasCalendario(inicio, dias, semanas);
  if (fechas.length === 0) {
    alert('No se pudieron generar sesiones.');
    return;
  }
  document.getElementById('calendario-container').style.display = 'block';
  renderizarCalendario(fechas);
  habilitarEdicion(fechas);
};
