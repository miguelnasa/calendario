const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const diasSemana = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado"
];

// Formato requerido: 20 Agosto 2025
function formatearFechaLarga(fecha) {
  const f = new Date(fecha);
  return `${f.getDate()} ${meses[f.getMonth()]} ${f.getFullYear()}`;
}

// Formateo de hora: 2 dígitos
function formatearHora(dateObj) {
  return dateObj.toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit', hour12: false});
}

// Generador del calendario con bloques de 60 minutos
function generarFechasCalendario(inicio, diasSeleccionados, numeroSemanas, horaIni, horaFin) {
  let sesiones = [];
  let fechaActual = new Date(inicio);
  const totalSemanas = parseInt(numeroSemanas, 10);

  // Duración de clase en minutos
  const [hIni, mIni] = horaIni.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  const totalMin = ((hFin * 60 + mFin) - (hIni * 60 + mIni));
  if (totalMin <= 0) {
    return []; // Hora fin debe ser posterior a inicio
  }
  const bloques = Math.ceil(totalMin / 60);

  let semanaActual = 1;
  while (semanaActual <= totalSemanas) {
    // Insertar semana libre después de la 8 si aplica
    if (semanaActual === 9 && totalSemanas > 8) {
      fechaActual.setDate(fechaActual.getDate() + 7);
    }
    // Para cada día seleccionado en la semana
    for (let dia of diasSeleccionados) {
      // Calcular fecha de ese día en la semana
      let f = new Date(fechaActual);
      f.setDate(f.getDate() + ((dia - f.getDay() + 7) % 7));
      // Para cada bloque horario (de 60 minutos)
      for (let b = 0; b < bloques; b++) {
        let horaBloque = new Date(f);
        horaBloque.setHours(hIni + b, mIni, 0, 0);
        // No pasar de la horaFin
        if (
          horaBloque.getHours()*60 + horaBloque.getMinutes() >= hFin*60 + mFin
        ) continue;
        sesiones.push({
          fecha: new Date(f),
          diaSemana: diasSemana[f.getDay()],
          hora: formatearHora(horaBloque),
          tema: '',
          biblio: '',
          entregables: ''
        });
      }
    }
    // Siguiente semana
    fechaActual.setDate(fechaActual.getDate() + 7);
    semanaActual++;
  }
  // Orden total por fecha y hora
  sesiones.sort((a, b) => {
    if (a.fecha - b.fecha !== 0)
      return a.fecha - b.fecha;
    return a.hora.localeCompare(b.hora);
  });
  return sesiones;
}

function renderizarCalendario(sesiones) {
  const contenedor = document.getElementById('calendario');
  contenedor.innerHTML = "";
  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <tr>
      <th>Fecha</th><th>Día</th><th>Hora</th>
      <th>Tema de trabajo</th>
      <th>Bibliografía</th>
      <th>Entregables</th>
      <th>Editar</th>
    </tr>`;
  sesiones.forEach((sesion, idx) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${formatearFechaLarga(sesion.fecha)}</td>
      <td>${sesion.diaSemana}</td>
      <td>${sesion.hora}</td>
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

function habilitarEdicion(sesiones) {
  document.getElementById('calendario').addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-btn')) {
      const idx = e.target.dataset.idx;
      editarFila(idx, sesiones);
    }
  });
}

function editarFila(idx, sesiones) {
  const sesion = sesiones[idx];
  const modal = document.createElement('div');
  modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.2);display:flex;justify-content:center;align-items:center;z-index:10;";
  modal.innerHTML = `
    <form id="modalForm" style="background:#fff;padding:1.5em;border-radius:8px;max-width:370px;box-shadow:0 1px 10px #888;">
      <h3>Editar: ${formatearFechaLarga(sesion.fecha)} | ${sesion.diaSemana} | ${sesion.hora}</h3>
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
    renderizarCalendario(sesiones);
  };
}

document.getElementById('formulario').onsubmit = function(e) {
  e.preventDefault();
  const codigo = document.getElementById('codigo-curso').value.trim();
  const nombre = document.getElementById('nombre-curso').value.trim();
  const inicio = document.getElementById('fecha-inicio').value;
  const horaIni = document.getElementById('hora-inicio').value;
  const horaFin = document.getElementById('hora-fin').value;
  const dias = Array.from(document.querySelectorAll('input[name="dias"]:checked')).map(cb => parseInt(cb.value));
  const semanas = parseInt(document.getElementById('semanas').value);

  if (!codigo || !nombre || !inicio || !horaIni || !horaFin || dias.length === 0) {
    alert('Complete todos los campos y seleccione al menos un día.');
    return;
  }
  const sesiones = generarFechasCalendario(inicio, dias, semanas, horaIni, horaFin);
  if (sesiones.length === 0) {
    alert('Verifique que la hora de fin sea mayor que la inicio y al menos un intervalo de 60 minutos.');
    return;
  }
  document.getElementById('info-curso').innerHTML = `<span>Código:</span> ${codigo} &nbsp; | &nbsp; <span>Curso:</span> ${nombre}`;
  document.getElementById('calendario-container').style.display = 'block';
  renderizarCalendario(sesiones);
  habilitarEdicion(sesiones);
};
