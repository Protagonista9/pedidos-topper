let fp;

function initFlatpickr() {
    if (fp) fp.destroy();

    const agora = new Date();

    // Mínimo permitido: 2 horas após o horário atual
    const dataMinima = new Date(agora.getTime() + 2 * 60 * 60 * 1000);

    const anoMinimo = dataMinima.getFullYear();
    const mesMinimo = dataMinima.getMonth();

    function bloquearDigitacaoAno(instance) {
        const campoAno = instance.currentYearElement;

        if (!campoAno || campoAno.dataset.bloqueado === 'true') return;

        campoAno.dataset.bloqueado = 'true';
        campoAno.setAttribute('min', anoMinimo);

        campoAno.addEventListener('keydown', function (e) {
            const teclasPermitidas = ['Tab', 'ArrowUp', 'ArrowDown'];

            if (!teclasPermitidas.includes(e.key)) {
                e.preventDefault();
            }
        });

        campoAno.addEventListener('paste', function (e) {
            e.preventDefault();
        });

        campoAno.addEventListener('input', function () {
            if (Number(campoAno.value) < anoMinimo) {
                campoAno.value = anoMinimo;
                instance.changeYear(anoMinimo);
                instance.changeMonth(mesMinimo, false);
            }
        });
    }

    function corrigirHoraMinuto(instance) {
        const horaInput = instance.hourElement;
        const minutoInput = instance.minuteElement;

        if (horaInput && horaInput.dataset.corrigido !== 'true') {
            horaInput.dataset.corrigido = 'true';

            horaInput.addEventListener('input', function () {
                let valor = this.value.replace(/\D/g, '');

                valor = valor.slice(0, 2);

                if (Number(valor) > 23) {
                    valor = '23';
                }

                this.value = valor;
            });

            horaInput.addEventListener('blur', function () {
                let valor = this.value.replace(/\D/g, '');

                if (valor === '') valor = '00';
                if (Number(valor) > 23) valor = '23';

                this.value = valor.padStart(2, '0');
            });
        }

        if (minutoInput && minutoInput.dataset.corrigido !== 'true') {
            minutoInput.dataset.corrigido = 'true';

            minutoInput.addEventListener('input', function () {
                let valor = this.value.replace(/\D/g, '');

                valor = valor.slice(0, 2);

                if (Number(valor) > 59) {
                    valor = '59';
                }

                this.value = valor;
            });

            minutoInput.addEventListener('blur', function () {
                let valor = this.value.replace(/\D/g, '');

                if (valor === '') valor = '00';
                if (Number(valor) > 59) valor = '59';

                this.value = valor.padStart(2, '0');
            });
        }
    }

    function validarDataMinima(selectedDates, instance) {
        if (!selectedDates || selectedDates.length === 0) return;

        const dataSelecionada = selectedDates[0];

        if (dataSelecionada < dataMinima) {
            instance.setDate(dataMinima, true);

            alert('Escolha um horário com no mínimo 2 horas de antecedência.');
        }
    }

    fp = flatpickr('#data_entrega', {
        minDate: dataMinima,
        locale: 'pt',
        dateFormat: 'd/m/Y H:i',
        enableTime: true,
        time_24hr: true,
        minuteIncrement: 10,
        position: 'auto center',
        disableMobile: false,

        onReady: function(selectedDates, dateStr, instance) {
            bloquearDigitacaoAno(instance);
            corrigirHoraMinuto(instance);
        },

        onOpen: function(selectedDates, dateStr, instance) {
            document.getElementById('calendar-overlay').classList.add('active');
            bloquearDigitacaoAno(instance);
            corrigirHoraMinuto(instance);
        },

        onClose: function(selectedDates, dateStr, instance) {
            document.getElementById('calendar-overlay').classList.remove('active');
            validarDataMinima(selectedDates, instance);
        },

        onChange: function(selectedDates, dateStr, instance) {
            validarDataMinima(selectedDates, instance);
        },

        onYearChange: function(selectedDates, dateStr, instance) {
            const anoSelecionado = instance.currentYear;

            bloquearDigitacaoAno(instance);
            corrigirHoraMinuto(instance);

            if (anoSelecionado < anoMinimo) {
                instance.changeYear(anoMinimo);
                instance.changeMonth(mesMinimo, false);
            }
        },

        onMonthChange: function(selectedDates, dateStr, instance) {
            const anoSelecionado = instance.currentYear;
            const mesSelecionado = instance.currentMonth;

            bloquearDigitacaoAno(instance);
            corrigirHoraMinuto(instance);

            if (anoSelecionado < anoMinimo) {
                instance.changeYear(anoMinimo);
                instance.changeMonth(mesMinimo, false);
            }

            if (anoSelecionado === anoMinimo && mesSelecionado < mesMinimo) {
                instance.changeMonth(mesMinimo, false);
            }
        }
    });
}

function fecharCalendario() {
    if (fp) fp.close();
}

initFlatpickr();