<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>🚨 Reporte de Mantenimiento</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
  <style>
    :root {
      --bg: #faf8f2;
      --card-bg: #fff8e1;
      --text: #333;
      --label: #6F4E37;
      --border: #e0e0e0;
      --accent: #6F4E37;
      --accent-hover: #563C2D;
      --radius: 8px;
      --spacing: 1rem;
      --font-body: 'Inter', sans-serif;
      --font-heading: 'Playfair Display', serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 0;
      background: var(--bg);
      font-family: var(--font-body);
    }
    .container {
      background: var(--card-bg);
      max-width: 480px;
      margin: 1rem auto;
      padding: 2rem;
      border-radius: var(--radius);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .logo {
      display: block;
      margin: 0 auto 1rem;
      width: 300px;
    }
    h2 {
      text-align: center;
      color: var(--label);
      font-family: var(--font-heading);
    }
    label {
      font-weight: 600;
      display: block;
      margin-top: 1rem;
      color: var(--label);
    }
    input, select, textarea {
      width: 100%; padding: 0.75rem;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      font-family: var(--font-body);
    }
    input[readonly] { background-color: #eee; }
    input[type="hidden"] { display: none; }
    button {
      width: 100%;
      margin-top: 1.5rem;
      padding: 1rem;
      background: var(--accent);
      color: white;
      border: none;
      font-weight: bold;
      font-family: var(--font-heading);
      font-size: 1rem;
      border-radius: var(--radius);
      cursor: pointer;
    }
    button:hover { background: var(--accent-hover); }
    .disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="logo LM mantenimientocafe.png" class="logo" />
    <h2>🚨 Reporte de Mantenimiento</h2>
    <form id="form">
      <!-- ID y chat_id (no modificables salvo modo manual) -->
      <label for="reportId">ID del Reporte</label>
      <input type="text" id="reportId" readonly />

      <label for="chat_id">Chat ID</label>
      <input type="text" id="chat_id" />

      <!-- 1) Seleccionar Zona -->
      <label for="zona">Zona</label>
      <select id="zona" required>
        <option value="">Seleccione una zona</option>
        <!-- se llenará dinámicamente con 7 zonas -->
      </select>

      <!-- 2) Seleccionar Tienda (7 por zona) -->
      <label for="tienda">Tienda</label>
      <select id="tienda" required disabled>
        <option value="">Seleccione primero una zona</option>
        <!-- se llenará tras elegir zona -->
      </select>

      <!-- Campos ocultos para latitud y longitud y supervisor -->
      <input type="hidden" id="latitud" name="lat" />
      <input type="hidden" id="longitud" name="lng" />
      <input type="hidden" id="supervisor" name="supervisor" />

      <!-- Resto de campos, inicialmente deshabilitados hasta que se elija una tienda -->
      <label for="tipoProblema">Tipo de problema</label>
      <input type="text" id="tipoProblema" required disabled />

      <label for="prioridad">Prioridad</label>
      <select id="prioridad" required disabled>
        <option value="">Seleccione prioridad</option>
        <option>Alta</option>
        <option>Media</option>
        <option>Baja</option>
      </select>

      <label for="descripcion">Descripción</label>
      <textarea id="descripcion" required disabled></textarea>

      <label for="evidencia">Evidencia (máx. 6 archivos)</label>
      <input type="file" id="evidencia" multiple accept="image/*,video/*" disabled />

      <label for="tecnicoAsignado">Técnico asignado</label>
      <select id="tecnicoAsignado" required disabled>
        <option value="">Seleccione técnico</option>
      </select>

      <div class="form-group" id="tecnicoChatManual" style="display: none;">
        <label for="chat_id_tecnico">Chat ID del Técnico</label>
        <input type="text" id="chat_id_tecnico" />
      </div>

      <button type="submit" id="submitBtn" class="disabled">Enviar Reporte</button>
    </form>
  </div>

  <script>
    const tg = window.Telegram.WebApp;
    const supabase = window.supabase.createClient(
      'https://gaiqdzjctyscufkljxvm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaXFkempjdHlzY3Vma2xqeHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDU1NDUsImV4cCI6MjA2MzY4MTU0NX0._FvgAfqrHVzQtlPpFpPEl6HcGCnOQka2nfhRzT1LUcQ'
    );

    // 1. Datos de zonas y sus tiendas (7 zonas x 7 tiendas)
    const zonesData = [
      {
        zona: "Zona 1",
        tiendas: [
          { nombre: "Tienda 1A", técnico: "Baron", lat: 19.4300, lng: -99.1400 },
          { nombre: "Tienda 1B", técnico: "Cecilio", lat: 19.4310, lng: -99.1410 },
          { nombre: "Tienda 1C", técnico: "Baron", lat: 19.4320, lng: -99.1420 },
          { nombre: "Tienda 1D", técnico: "Cecilio", lat: 19.4330, lng: -99.1430 },
          { nombre: "Tienda 1E", técnico: "Baron", lat: 19.4340, lng: -99.1440 },
          { nombre: "Tienda 1F", técnico: "Cecilio", lat: 19.4350, lng: -99.1450 },
          { nombre: "Tienda 1G", técnico: "Baron", lat: 19.4360, lng: -99.1460 },
        ]
      },
      {
        zona: "Zona 2",
        tiendas: [
          { nombre: "Tienda 2A", técnico: "Cecilio", lat: 19.4400, lng: -99.1500 },
          { nombre: "Tienda 2B", técnico: "Baron", lat: 19.4410, lng: -99.1510 },
          { nombre: "Tienda 2C", técnico: "Cecilio", lat: 19.4420, lng: -99.1520 },
          { nombre: "Tienda 2D", técnico: "Baron", lat: 19.4430, lng: -99.1530 },
          { nombre: "Tienda 2E", técnico: "Cecilio", lat: 19.4440, lng: -99.1540 },
          { nombre: "Tienda 2F", técnico: "Baron", lat: 19.4450, lng: -99.1550 },
          { nombre: "Tienda 2G", técnico: "Cecilio", lat: 19.4460, lng: -99.1560 },
        ]
      },
      {
        zona: "Zona 3",
        tiendas: [
          { nombre: "CSF1", técnico: "Baron", lat: 19.361622577908765, lng: -99.27369110503003 },
          { nombre: "CSF3", técnico: "Baron", lat: 19.361622577908765, lng: -99.27369110503003 },
          { nombre: "GI1", técnico: "Baron", lat: 19.37086109035985, lng:-99.17907847434083  }, 
          { nombre: "PIIN1", técnico: "Baron", lat: 19.352144225789278, lng:  -99.18643096084959},
          { nombre: "PIIN2", técnico: "Baron", lat: 19.352144225789278, lng:  -99.18643096084959},
          { nombre: "OC1", técnico: "Cecilio", lat: 19.34650547173084, lng: -99.17893969275647 }, 
          { nombre: "PQA1", técnico: "Baron", lat: 19.314704556532728, lng:  -99.07673276085038}, 
          { nombre: "PQA2", técnico: "Cecilio", lat: 19.314704556532728, lng:  -99.07673276085038}, 
          { nombre: "PQA3", técnico: "Baron", lat: 19.314704556532728, lng:  -99.07673276085038}, 
          { nombre: "PU1", técnico: "Cecilio", lat: 19.367449957217325, lng: -99.16607869366918 }, 
          { nombre: "PU2", técnico: "Cecilio", lat: 19.367449957217325, lng: -99.16607869366918 }, 
          { nombre: "PU3", técnico: "Cecilio", lat: 19.367449957217325, lng: -99.16607869366918 }, 
          { nombre: "PU4", técnico: "Cecilio", lat: 19.367449957217325, lng: -99.16607869366918 }, 
          { nombre: "TM1", técnico: "Baron", lat: 19.369031592520038, lng: -99.18123076084929 },
          
        ]
      },
      {
        zona: "Zona 4",
        tiendas: [
          { nombre: "Tienda 4A", técnico: "Cecilio", lat: 19.4600, lng: -99.1700 },
          { nombre: "Tienda 4B", técnico: "Baron", lat: 19.4610, lng: -99.1710 },
          { nombre: "Tienda 4C", técnico: "Cecilio", lat: 19.4620, lng: -99.1720 },
          { nombre: "Tienda 4D", técnico: "Baron", lat: 19.4630, lng: -99.1730 },
          { nombre: "Tienda 4E", técnico: "Cecilio", lat: 19.4640, lng: -99.1740 },
          { nombre: "Tienda 4F", técnico: "Baron", lat: 19.4650, lng: -99.1750 },
          { nombre: "Tienda 4G", técnico: "Cecilio", lat: 19.4660, lng: -99.1760 },
        ]
      },
      {
        zona: "Zona 5",
        tiendas: [
          { nombre: "CJ1", técnico: "Cecilio", lat: 19.42496840824301, lng: -99.02369710317588 }, 
          { nombre: "CJ2", técnico: "Cecilio", lat: 19.42496840824301, lng: -99.02369710317588 },
          { nombre: "CJ3", técnico: "Cecilio", lat: 19.42496840824301, lng: -99.02369710317588 },
          { nombre: "E02", técnico: "Baron", lat: 19.439644962177717, lng: -99.09432233507172 }, 
          { nombre: "PAME1", técnico: "Baron", lat: 19.584131282783183, lng: -99.02288428216144 }, 
          { nombre: "PAME3", técnico: "Baron", lat: 19.584131282783183, lng: -99.02288428216144 }, 
          { nombre: "PAME4", técnico: "Baron", lat: 19.584131282783183, lng: -99.02288428216144 }, 
          { nombre: "PAME5", técnico: "Baron", lat: 19.584131282783183, lng: -99.02288428216144 }, 
          { nombre: "PARA1", técnico: "Cecilio", lat: 19.529949506046144, lng: -99.02730590317391 },
          { nombre: "PARA2", técnico: "Cecilio", lat: 19.529949506046144, lng: -99.02730590317391 },
          { nombre: "PARA3", técnico: "Cecilio", lat: 19.529949506046144, lng: -99.02730590317391 },
          { nombre: "PARA4", técnico: "Cecilio", lat: 19.529949506046144, lng: -99.02730590317391 },
          { nombre: "PPUE1", técnico: "Baron", lat: 19.06980900140871, lng: -98.171872061316 }, 
          { nombre: "PPUE2", técnico: "Baron", lat: 19.06980900140871, lng: -98.171872061316 },
          
        ]
      },
      {
        zona: "Zona 6",
        tiendas: [
          { nombre: "Tienda 6A", técnico: "Cecilio", lat: 19.4800, lng: -99.1900 },
          { nombre: "Tienda 6B", técnico: "Baron", lat: 19.4810, lng: -99.1910 },
          { nombre: "Tienda 6C", técnico: "Cecilio", lat: 19.4820, lng: -99.1920 },
          { nombre: "Tienda 6D", técnico: "Baron", lat: 19.4830, lng: -99.1930 },
          { nombre: "Tienda 6E", técnico: "Cecilio", lat: 19.4840, lng: -99.1940 },
          { nombre: "Tienda 6F", técnico: "Baron", lat: 19.4850, lng: -99.1950 },
          { nombre: "Tienda 6G", técnico: "Cecilio", lat: 19.4860, lng: -99.1960 },
        ]
      },
      {
        zona: "Zona 7",
        tiendas: [
          { nombre: "Tienda 7A", técnico: "Baron", lat: 19.4900, lng: -99.2000 },
          { nombre: "Tienda 7B", técnico: "Cecilio", lat: 19.4910, lng: -99.2010 },
          { nombre: "Tienda 7C", técnico: "Baron", lat: 19.4920, lng: -99.2020 },
          { nombre: "Tienda 7D", técnico: "Cecilio", lat: 19.4930, lng: -99.2030 },
          { nombre: "Tienda 7E", técnico: "Baron", lat: 19.4940, lng: -99.2040 },
          { nombre: "Tienda 7F", técnico: "Cecilio", lat: 19.4950, lng: -99.2050 },
          { nombre: "Tienda 7G", técnico: "Baron", lat: 19.4960, lng: -99.2060 },
        ]
      }
    ];

    tg.ready();

    document.addEventListener('DOMContentLoaded', () => {
      const supervisorNames = {
  '7939979525': 'Luciano',
  '1234567890': 'Juan',
  // …añade aquí todos los chat_id que necesites
};
      const chatId = tg?.initDataUnsafe?.user?.id || '';
      const modoManual = new URLSearchParams(location.search).get('modo') === 'manual';

      // Asignar ID del reporte y chat_id (lectura/solo lectura según modo manual)
      document.getElementById('reportId').value = crypto.randomUUID();
      document.getElementById('chat_id').value = chatId;
      document.getElementById('chat_id').readOnly = !modoManual;
      document.getElementById('reportId').readOnly = !modoManual;

            // 3) Rellenar hidden supervisor con el nombre
      document.getElementById('supervisor').value =
        supervisorNames[String(chatId)] || 'Desconocido';

      // Mostrar campo de chat_id_tecnico solo en modo manual
      const tecnicoChatGroup = document.getElementById('tecnicoChatManual');
      const tecnicoChatInput = document.getElementById('chat_id_tecnico');
      if (modoManual) {
        tecnicoChatInput.readOnly = false;
        tecnicoChatGroup.style.display = 'block';
      }

      // Llenar el select de zonas
      const zonaSelect = document.getElementById('zona');
      zonesData.forEach(z => {
        const opt = document.createElement('option');
        opt.value = z.zona;
        opt.textContent = z.zona;
        zonaSelect.appendChild(opt);
      });

      // Elementos del DOM
      const tiendaSelect = document.getElementById('tienda');
      const tipoProblemaInput = document.getElementById('tipoProblema');
      const prioridadSelect = document.getElementById('prioridad');
      const descripcionInput = document.getElementById('descripcion');
      const evidenciaInput = document.getElementById('evidencia');
      const tecnicoSelect = document.getElementById('tecnicoAsignado');
      const submitBtn = document.getElementById('submitBtn');
      const latInput = document.getElementById('latitud');
      const lngInput = document.getElementById('longitud');
      const supervisorInput = document.getElementById('supervisor');

      // ——— Validar máximo 6 archivos al seleccionar ———
evidenciaInput.addEventListener('change', () => {
  if (evidenciaInput.files.length > 6) {
    alert('Solo puedes subir hasta 6 archivos.');
    evidenciaInput.value = ''; // limpia selección
  }
});

      

      // Función para habilitar/deshabilitar campos del formulario
      const camposParaHabilitar = [
        tipoProblemaInput,
        prioridadSelect,
        descripcionInput,
        evidenciaInput,
        tecnicoSelect
      ];
      function setCamposDisabled(state) {
        camposParaHabilitar.forEach(c => c.disabled = state);
        if (state) submitBtn.classList.add('disabled');
        else submitBtn.classList.remove('disabled');
      }

      // Al inicio: deshabilitar tienda + resto de campos
      tiendaSelect.disabled = true;
      setCamposDisabled(true);

      // Cuando cambie zona
      zonaSelect.addEventListener('change', () => {
        const selZona = zonaSelect.value;
        tiendaSelect.innerHTML = '<option value="">Seleccione primero una zona válida</option>';
        latInput.value = '';
        lngInput.value = '';
        tecnicoSelect.innerHTML = '<option value="">Seleccione técnico</option>';
        tecnicoChatInput.value = '';
        setCamposDisabled(true);

        if (!selZona) {
          tiendaSelect.disabled = true;
        } else {
          // Habilitar el select de tienda y llenarlo con las tiendas de la zona
          tiendaSelect.disabled = false;
          const zonaObj = zonesData.find(z => z.zona === selZona);
          if (zonaObj) {
            zonaObj.tiendas.forEach(store => {
              const opt = document.createElement('option');
              opt.value = store.nombre;
              opt.textContent = store.nombre;
              tiendaSelect.appendChild(opt);
            });
          }
        }
      });

      // Cuando cambie tienda
      tiendaSelect.addEventListener('change', () => {
        const selZona = zonaSelect.value;
        const selTienda = tiendaSelect.value;
        latInput.value = '';
        lngInput.value = '';
        tecnicoSelect.innerHTML = '<option value="">Seleccione técnico</option>';
        tecnicoChatInput.value = '';
        setCamposDisabled(true);

        if (!selTienda) {
          // Si no hay tienda, mantener todo deshabilitado menos zona/tienda
          setCamposDisabled(true);
        } else {
          // Encontrar el objeto de la tienda seleccionada
          const zonaObj = zonesData.find(z => z.zona === selZona);
          const tiendaObj = zonaObj?.tiendas.find(t => t.nombre === selTienda);

          if (tiendaObj) {
            // Guardar latitud y longitud en campos ocultos
            latInput.value = tiendaObj.lat;
            lngInput.value = tiendaObj.lng;

            // Llenar técnicoAsignado con el técnico único de la tienda
            const optTec = document.createElement('option');
            optTec.value = tiendaObj.técnico;
            optTec.textContent = tiendaObj.técnico;
            tecnicoSelect.appendChild(optTec);

            // Si no es modo manual, asignar chat_id_tecnico según técnico seleccionado
            tecnicoSelect.addEventListener('change', () => {
              if (!modoManual) {
                let idTec = '';
                if (tiendaObj.técnico === 'Baron') idTec = '7939979525';
                else if (tiendaObj.técnico === 'Cecilio') idTec = '6452674052';
                tecnicoChatInput.value = idTec;
              }
            });

            // Habilitar el resto de campos y el botón enviar
            setCamposDisabled(false);
          }
        }
      });
    });

    // ——— 1) Subir resumible por chunk (5MB) ———
async function subirArchivo(file, path) {
  const ext      = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'');
  const filename = `${crypto.randomUUID()}.${ext}`;
  const fullPath = `${path}/${filename}`;

  const { error } = await supabase.storage
    .from('evidencias')
    .upload(fullPath, file, {
      contentType: file.type,
      resumable: true,
      chunkSize: 5 * 1024 * 1024
    });
  if (error) throw error;

  const { data } = supabase.storage.from('evidencias').getPublicUrl(fullPath);
  return data.publicUrl;
} // ← aquí cierra subirArchivo

// ——— 2) Comprimir imágenes a max 1024px y 70% calidad ———
async function comprimirImagen(file) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      const maxDim = 1024;
      if (width > height && width > maxDim) {
        height = height * maxDim / width;
        width  = maxDim;
      } else if (height > maxDim) {
        width  = width * maxDim / height;
        height = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height= height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        resolve(new File([blob], file.name, { type: file.type }));
      }, file.type, 0.7);
    };
  });
} // ← aquí cierra comprimirImagen

 // ——— Envío del formulario con compresión y subida paralela ———
document.getElementById('form').addEventListener('submit', async e => {
  e.preventDefault();

  // 1. Recoger todos los valores
  const id               = document.getElementById('reportId').value;
  const chat_id          = document.getElementById('chat_id').value;
  const chat_id_tecnico  = document.getElementById('chat_id_tecnico').value;
  const supervisor       = document.getElementById('supervisor').value;
  const zona             = document.getElementById('zona').value;
  const tienda           = document.getElementById('tienda').value;
  const tipoProblema     = document.getElementById('tipoProblema').value;
  const prioridad        = document.getElementById('prioridad').value;
  const descripcion      = document.getElementById('descripcion').value;
  const tecnicoAsignado  = document.getElementById('tecnicoAsignado').value;
  const lat              = document.getElementById('latitud').value;
  const lng              = document.getElementById('longitud').value;

  // 2. Validar y leer archivos
  const files = Array.from(document.getElementById('evidencia').files);
  if (files.length > 6) {
    return alert('Máximo 6 archivos');
  }

  // 3. (Opcional) Comprimir imágenes
  const procesados = await Promise.all(
    files.map(f =>
      f.type.startsWith('image/')
        ? comprimirImagen(f)
        : Promise.resolve(f)
    )
  );

  try {
    // 4. Subir **en paralelo** TODOS los archivos
    const urls = await Promise.all(
      procesados.map(f => subirArchivo(f, `Reportes/${id}`))
    );

    // 5. Insertar en Supabase ya con `evidencia: urls`
    const { error } = await supabase
      .from('Reportes')
      .insert([{
        id,
        chat_id,
        chat_id_tecnico,
        zona,
        tienda,
        tipoProblema,
        prioridad,
        descripcion,
        tecnicoAsignado,
        supervisor,
        fecha: new Date().toISOString(),
        lat,
        lng,
        evidencia: urls
      }]);

    if (error) throw error;

    alert('✅ Reporte enviado con éxito');
    document.getElementById('form').reset();
  } catch (err) {
    console.error(err);
    alert('❌ Error al enviar el reporte.');
  }
});
  </script>
</body>
</html>
