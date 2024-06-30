const allowedSensorTypes = ['temperature', 'humidity', 'pressure'];

class Sensor {
  constructor(id, name, type, value, unit, updated_at) {
    if (!allowedSensorTypes.includes(type)) {
      throw new Error(`Tipo de sensor no válido: ${type}`);
    }
    this.id = id;
    this.name = name;
    this.type = type;
    this.value = value;
    this.unit = unit;
    this.updated_at = updated_at;
  }

  set updateValue(newValue) {
    this.value = newValue;
    this.updated_at = new Date().toISOString();
  }
}

class SensorManager {
  constructor() {
    this.sensors = [];
  }

  addSensor(sensor) {
    this.sensors.push(sensor);
  }

  updateSensor(id) {
    console.log(`Actualizando sensor con ID: ${id}`);
    const sensor = this.sensors.find((sensor) => sensor.id === id);
    if (sensor) {
      console.log(`Sensor encontrado: ${sensor.name}`);
      if (!allowedSensorTypes.includes(sensor.type)) {
        console.error(`Tipo de sensor no válido: ${sensor.type}`);
        return;
      }

      let newValue;
      switch (sensor.type) {
        case "temperature":
          newValue = (Math.random() * 80 - 30).toFixed(2);
          break;
        case "humidity":
          newValue = (Math.random() * 100).toFixed(2);
          break;
        case "pressure":
          newValue = (Math.random() * 80 + 960).toFixed(2);
          break;
        default:
          newValue = (Math.random() * 100).toFixed(2);
      }
      console.log(`Nuevo valor para el sensor: ${newValue}`);
      sensor.updateValue = newValue;
      this.render();
    } else {
      console.error(`Sensor ID ${id} no encontrado`);
    }
  }

  async loadSensors(url) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          data.forEach(sensorData => {
            if (!allowedSensorTypes.includes(sensorData.type)) {
              console.error(`Tipo de sensor no válido en datos: ${sensorData.type}`);
              return;
            }
            const sensor = new Sensor(
              sensorData.id,
              sensorData.name,
              sensorData.type,
              sensorData.value,
              sensorData.unit,
              sensorData.updated_at
            );
            this.addSensor(sensor);
          });
          this.render();
        } else if (xhr.readyState === 4) {
          console.error("Error al cargar los sensores:", xhr.statusText);
        }
      };
      xhr.send();
    } catch (error) {
      console.error("Error al cargar los sensores:", error);
    }
  }

  render() {
    const container = document.getElementById("sensor-container");
    if (container) {
      container.innerHTML = "";
      this.sensors.forEach((sensor) => {
        const sensorCard = document.createElement("div");
        sensorCard.className = "column is-one-third";
        sensorCard.innerHTML = `
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                Sensor ID: ${sensor.id}
              </p>
            </header>
            <div class="card-content">
              <div class="content">
                <p>
                  <strong>Tipo:</strong> ${sensor.type}
                </p>
                <p>
                  <strong>Valor:</strong> 
                  ${sensor.value} ${sensor.unit}
                </p>
              </div>
              <time datetime="${sensor.updated_at}">
                Última actualización: ${new Date(sensor.updated_at).toLocaleString()}
              </time>
            </div>
            <footer class="card-footer">
              <a href="#" class="card-footer-item update-button" data-id="${sensor.id}">Actualizar</a>
            </footer>
          </div>`;
        container.appendChild(sensorCard);
      });

      const updateButtons = document.querySelectorAll(".update-button");
      updateButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          const sensorId = parseInt(button.getAttribute("data-id"));
          console.log(`Botón de actualización clicado para el sensor ID: ${sensorId}`);
          this.updateSensor(sensorId);
        });
      });
    }
  }
}

const monitor = new SensorManager();
monitor.loadSensors("sensors.json");
