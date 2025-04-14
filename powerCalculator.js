class PowerCalculator {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeACWaveChart();
        this.conversionFactors = {
            voltage: {
                'V': 1,
                'kV': 1000,
                'mV': 0.001
            },
            current: {
                'A': 1,
                'kA': 1000,
                'mA': 0.001
            },
            frequency: {
                'Hz': 1,
                'kHz': 1000
            }
        };
    }

    initializeElements() {
        // Input elements (parte blu)
        this.voltageInput = document.getElementById('voltage');        // Tensione
        this.currentInput = document.getElementById('current');        // Corrente
        this.frequencyInput = document.getElementById('frequency');    // Frequenza
        this.powerFactorInput = document.getElementById('powerFactor'); // Fattore di Potenza

        // Output elements (parte rossa)
        this.activePowerOutput = document.getElementById('activePower');     // Potenza Attiva
        this.reactivePowerOutput = document.getElementById('reactivePower'); // Potenza Reattiva
        this.apparentPowerOutput = document.getElementById('apparentPower'); // Potenza Apparente
        this.impedanceOutput = document.getElementById('impedance');         // Impedenza
        this.phaseAngleOutput = document.getElementById('phaseAngle');      // Angolo di Fase
        this.reactivityFactorOutput = document.getElementById('reactivityFactor'); // Fattore di Reattività
        
        // Unit selectors
        this.voltageUnit = document.getElementById('voltageUnit');
        this.currentUnit = document.getElementById('currentUnit');
        this.frequencyUnit = document.getElementById('frequencyUnit');
        
        // Chart
        this.powerTriangleCtx = document.getElementById('powerTriangle').getContext('2d');
    }

    initializeEventListeners() {
        // Aggiungi listener per tutti gli input
        const inputs = [
            this.voltageInput,
            this.currentInput,
            this.frequencyInput,
            this.powerFactorInput,
            this.voltageUnit,
            this.currentUnit,
            this.frequencyUnit
        ];

        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculateAll());
        });
    }

    convertValue(value, unit, type) {
        return value * this.conversionFactors[type][unit];
    }

    calculateAll() {
        // Ottieni i valori dagli input
        const V = parseFloat(this.voltageInput.value) || 0;    // Tensione
        const I = parseFloat(this.currentInput.value) || 0;    // Corrente
        const f = parseFloat(this.frequencyInput.value) || 50; // Frequenza
        const cosφ = parseFloat(this.powerFactorInput.value) || 0; // Fattore di potenza

        // Calcola l'angolo di fase in radianti
        const φ = Math.acos(cosφ);

        // Calcola le potenze
        const S = V * I;                  // Potenza Apparente
        const P = S * cosφ;               // Potenza Attiva
        const Q = S * Math.sin(φ);        // Potenza Reattiva

        // Calcola l'impedenza
        const Z = V / I || 0;             // Impedenza

        // Calcola il fattore di reattività
        const sinφ = Math.sin(φ);         // Fattore di Reattività

        // Aggiorna i risultati (parte rossa)
        this.updateResults({
            P: P,
            Q: Q,
            S: S,
            Z: Z,
            φ: φ * (180 / Math.PI), // Converti in gradi
            sinφ: sinφ
        });

        // Update power triangle
        this.updatePowerTriangle(P, Q, S);

        // Aggiorna il grafico con i nuovi valori
        this.updateChart(P, Q, S);

        // Aggiorna il grafico AC
        this.updateACWave(φ);
    }

    updateResults(results) {
        // Aggiorna i display con formattazione
        this.activePowerOutput.textContent = this.formatNumber(results.P);
        this.reactivePowerOutput.textContent = this.formatNumber(results.Q);
        this.apparentPowerOutput.textContent = this.formatNumber(results.S);
        this.impedanceOutput.textContent = this.formatNumber(results.Z);
        this.phaseAngleOutput.textContent = this.formatNumber(results.φ);
        this.reactivityFactorOutput.textContent = this.formatNumber(results.sinφ);

        // Aggiungi classe per evidenziare i cambiamenti
        const outputs = [
            this.activePowerOutput,
            this.reactivePowerOutput,
            this.apparentPowerOutput,
            this.impedanceOutput,
            this.phaseAngleOutput,
            this.reactivityFactorOutput
        ];

        outputs.forEach(output => {
            output.classList.add('updated');
            setTimeout(() => output.classList.remove('updated'), 300);
        });
    }

    formatNumber(num) {
        // Formatta i numeri per la visualizzazione
        if (isNaN(num) || !isFinite(num)) return '0';
        if (Math.abs(num) < 0.01 && num !== 0) return num.toExponential(2);
        return num.toFixed(2).replace(/\.?0+$/, '');
    }

    updatePowerTriangle(P, Q, S) {
        // Normalize values for better visualization
        const scale = Math.max(P, Q, S) || 1;
        const normalizedP = (P / scale) * 100;
        const normalizedQ = (Q / scale) * 100;

        const data = [
            { x: 0, y: 0 },
            { x: normalizedP, y: 0 },
            { x: normalizedP, y: normalizedQ },
            { x: 0, y: 0 }
        ];

        this.powerChart.data.datasets[0].data = data;
        this.powerChart.update();
    }

    initializePowerChart() {
        this.powerChart = new Chart(this.powerTriangleCtx, {
            type: 'line',
            data: {
                labels: [], // Sarà popolato con i valori temporali
                datasets: [
                    {
                        label: 'Potenza Attiva (P)',
                        borderColor: '#00ff95',
                        backgroundColor: 'rgba(0, 255, 149, 0.1)',
                        data: [],
                        tension: 0.4
                    },
                    {
                        label: 'Potenza Reattiva (Q)',
                        borderColor: '#ff3e88',
                        backgroundColor: 'rgba(255, 62, 136, 0.1)',
                        data: [],
                        tension: 0.4
                    },
                    {
                        label: 'Potenza Apparente (S)',
                        borderColor: '#00c3ff',
                        backgroundColor: 'rgba(0, 195, 255, 0.1)',
                        data: [],
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e0e0e0',
                            font: {
                                size: 11
                            },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(45, 45, 45, 0.9)',
                        titleColor: '#00ff95',
                        bodyColor: '#e0e0e0',
                        borderColor: '#404040',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#404040',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#e0e0e0'
                        },
                        title: {
                            display: true,
                            text: 'Tempo',
                            color: '#e0e0e0'
                        }
                    },
                    y: {
                        grid: {
                            color: '#404040',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#e0e0e0'
                        },
                        title: {
                            display: true,
                            text: 'Potenza',
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        });

        // Inizializza i dati del grafico
        this.chartData = {
            P: [],
            Q: [],
            S: [],
            timePoints: []
        };
    }

    updateChart(P, Q, S) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();

        // Mantieni solo gli ultimi 10 punti
        if (this.chartData.timePoints.length > 10) {
            this.chartData.timePoints.shift();
            this.chartData.P.shift();
            this.chartData.Q.shift();
            this.chartData.S.shift();
        }

        // Aggiungi nuovi dati
        this.chartData.timePoints.push(timeStr);
        this.chartData.P.push(P);
        this.chartData.Q.push(Q);
        this.chartData.S.push(S);

        // Aggiorna il grafico
        this.powerChart.data.labels = this.chartData.timePoints;
        this.powerChart.data.datasets[0].data = this.chartData.P;
        this.powerChart.data.datasets[1].data = this.chartData.Q;
        this.powerChart.data.datasets[2].data = this.chartData.S;

        this.powerChart.update('none');
    }

    initializeACWaveChart() {
        const ctx = document.getElementById('acWaveChart').getContext('2d');
        
        // Genera i punti per la sinusoide
        const points = 100;
        const labels = Array.from({length: points}, (_, i) => i);
        const voltageData = Array.from({length: points}, (_, i) => 
            Math.sin(i * 2 * Math.PI / points));
        const currentData = Array.from({length: points}, (_, i) => 
            Math.sin(i * 2 * Math.PI / points + parseFloat(this.powerFactorInput.value || 0) * Math.PI));

        this.acWaveChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Tensione',
                        data: voltageData,
                        borderColor: '#00ff95',
                        borderWidth: 1.5,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Corrente',
                        data: currentData,
                        borderColor: '#ff3e88',
                        borderWidth: 1.5,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 0
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: true,
                        grid: {
                            color: '#404040'
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                size: 10
                            }
                        },
                        min: -1.2,
                        max: 1.2
                    }
                }
            }
        });
    }

    updateACWave(phaseAngle) {
        if (!this.acWaveChart) return;

        const points = 100;
        const voltageData = Array.from({length: points}, (_, i) => 
            Math.sin(i * 2 * Math.PI / points));
        const currentData = Array.from({length: points}, (_, i) => 
            Math.sin(i * 2 * Math.PI / points - phaseAngle));

        this.acWaveChart.data.datasets[0].data = voltageData;
        this.acWaveChart.data.datasets[1].data = currentData;
        this.acWaveChart.update('none');
    }
}

// Inizializza il calcolatore quando il documento è caricato
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new PowerCalculator();
}); 