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
  </style>
</head>
<body>
  <div class="container">
    <img src="logo LM mantenimientocafe.png" class="logo" />
    <h2>🚨 Reporte de Mantenimiento</h2>
    <form id="form">
      <label for="reportId">ID del Reporte</label>
      <input type="text" id="reportId" readonly />

      <label for="chat_id">Chat ID</label>
      <input type="text" id="chat_id" />

      <label for="tienda">Tienda</label>
      <select id="tienda" required>
        <option value="">Seleccione una tienda</option>
        <option>Tienda 1</option>
        <option>Tienda 2</option>
      </select>

      <label for="tipoProblema">Tipo de problema</label>
      <input type="text" id="tipoProblema" required />

      <label for="prioridad">Prioridad</label>
      <select id="prioridad" required>
        <option value="">Seleccione prioridad</option>
        <option>Alta</option>
        <option>Media</option>
        <option>Baja</option>
      </select>

      <label for="descripcion">Descripción</label>
      <textarea id="descripcion" required></textarea>

      <label for="evidencia">Evidencia (máx. 6 archivos)</label>
      <input type="file" id="evidencia" multiple accept="image/*,video/*" />

      <label for="tecnicoAsignado">Técnico asignado</label>
      <select id="tecnicoAsignado" required>
        <option value="">Seleccione técnico</option>
        <option>Baron</option>
        <option>Cecilio</option>
      </select>

      <div class="form-group" id="tecnicoChatManual" style="display: none;">
        <label for="chat_id_tecnico">Chat ID del Técnico</label>
        <input type="text" id="chat_id_tecnico" />
      </div>

      <button type="submit">Enviar Reporte</button>
    </form>
  </div>

  <script>
    const tg = window.Telegram.WebApp;
    const supabase = window.supabase.createClient(
      'https://gaiqdzjctyscufkljxvm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaXFkempjdHlzY3Vma2xqeHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDU1NDUsImV4cCI6MjA2MzY4MTU0NX0._FvgAfqrHVzQtlPpFpPEl6HcGCnOQka2nfhRzT1LUcQ'
    );

    tg.ready();

    document.addEventListener('DOMContentLoaded', () => {
      const chatId = tg?.initDataUnsafe?.user?.id || '';
      const modoManual = new URLSearchParams(location.search).get('modo') === 'manual';

      document.getElementById('reportId').value = crypto.randomUUID();
      document.getElementById('chat_id').value = chatId;
      document.getElementById('chat_id').readOnly = !modoManual;
      document.getElementById('reportId').readOnly = !modoManual;

      const tecnicoChat = document.getElementById('chat_id_tecnico');
      const tecnicoSelect = document.getElementById('tecnicoAsignado');

      if (modoManual) {
        tecnicoChat.readOnly = false;
        document.getElementById('tecnicoChatManual').style.display = 'block';
      }

      tecnicoSelect.addEventListener('change', () => {
        const tecnico = tecnicoSelect.value;
        const id = tecnico === 'Baron' ? '7939979525' : tecnico === 'Cecilio' ? '7939979525' : '';
        if (!modoManual) tecnicoChat.value = id;
      });
    });

    async function subirArchivo(file, path) {
      const extension = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
      const filename = `${crypto.randomUUID()}.${extension}`;
      const fullPath = `${path}/${filename}`;
      const { error: uploadError } = await supabase.storage.from('evidencias').upload(fullPath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('evidencias').getPublicUrl(fullPath);
      return data.publicUrl;
    }

    document.getElementById('form').addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.target;
      const id = document.getElementById('reportId').value;
      const chat_id = document.getElementById('chat_id').value;
      const chat_id_tecnico = document.getElementById('chat_id_tecnico').value;
      const evidenciaInput = document.getElementById('evidencia');
      const files = Array.from(evidenciaInput.files);
      if (files.length > 6) return alert('Máximo 6 archivos');

      try {
        const urls = [];
        for (const f of files) {
          const url = await subirArchivo(f, `Reportes/${id}`);
          urls.push(url);
        }

        const { error } = await supabase.from('Reportes').insert([{  
          id,
          chat_id,
          chat_id_tecnico,
          tienda: form.tienda.value,
          tipoProblema: form.tipoProblema.value,
          prioridad: form.prioridad.value,
          descripcion: form.descripcion.value,
          tecnicoAsignado: form.tecnicoAsignado.value,
          fecha: new Date().toISOString(),
          evidencia: urls
        }]);

        if (error) throw error;
        alert('✅ Reporte enviado con éxito');
        form.reset();
      } catch (err) {
        console.error('Error:', err);
        alert('❌ Error al enviar el reporte.');
      }
    });
  </script>
</body>
</html>
