document.addEventListener('DOMContentLoaded', () => {
    const awesomeBid = document.getElementById('awesome-bid');
    const awesomeAsk = document.getElementById('awesome-ask');
    const awesomeVarbid = document.getElementById('awesome-varbid');
    const awesomeHigh = document.getElementById('awesome-high');
    const awesomeLow = document.getElementById('awesome-low');
    const awesomeTimestamp = document.getElementById('awesome-timestamp');

    const foxbitLast = document.getElementById('foxbit-last');
    const foxbitChange = document.getElementById('foxbit-change');
    const foxbitVolume = document.getElementById('foxbit-volume');
    const foxbitTimestamp = document.getElementById('foxbit-timestamp');

    const avgRateEl = document.getElementById('avg-rate');
    const markupInput = document.getElementById('markup-percentage');
    const finalValueEl = document.getElementById('final-value');

    const refreshBtn = document.getElementById('refresh-btn');
    const loadingEl = document.getElementById('loading');

    const API1_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';
    const API2_URL = 'https://api.foxbit.com.br/v3/markets/usdtbrl/ticker';

    let awesomeApiRate = 0;
    let foxbitApiRate = 0;

    async function fetchRates() {
        loadingEl.style.display = 'block';
        try {
            const [awesomeResponse, foxbitResponse] = await Promise.all([
                fetch(API1_URL),
                fetch(API2_URL)
            ]);

            if (!awesomeResponse.ok || !foxbitResponse.ok) {
                throw new Error('Erro ao buscar dados das APIs.');
            }

            const awesomeData = await awesomeResponse.json();
            const foxbitData = await foxbitResponse.json();
            
            // AwesomeAPI
            const { bid, ask, varBid, high, low, create_date } = awesomeData.USDBRL;
            awesomeApiRate = parseFloat(ask);
            awesomeBid.textContent = formatCurrency(bid);
            awesomeAsk.textContent = formatCurrency(ask);
            awesomeVarbid.textContent = varBid;
            awesomeHigh.textContent = formatCurrency(high);
            awesomeLow.textContent = formatCurrency(low);
            awesomeTimestamp.textContent = new Date(create_date).toLocaleString('pt-BR');

            // Foxbit
            const { last, quote_volume_24h, high_24h, low_24h, open_24h } = foxbitData;
            foxbitApiRate = parseFloat(last);
            const change = ((last - open_24h) / open_24h) * 100;
            foxbitLast.textContent = formatCurrency(last);
            foxbitChange.textContent = change.toFixed(2);
            foxbitVolume.textContent = parseFloat(quote_volume_24h).toFixed(2);
            foxbitTimestamp.textContent = new Date().toLocaleString('pt-BR');

            calculateValues();

        } catch (error) {
            console.error(error);
            alert('Não foi possível carregar os dados. Tente novamente.');
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    function calculateValues() {
        if (awesomeApiRate > 0 && foxbitApiRate > 0) {
            const average = (awesomeApiRate + foxbitApiRate) / 2;
            avgRateEl.textContent = formatCurrency(average);

            const markupPercentage = parseFloat(markupInput.value) || 0;
            const markupValue = average * (markupPercentage / 100);
            const finalValue = average + markupValue;

            finalValueEl.textContent = formatCurrency(finalValue);
        }
    }
    
    function formatCurrency(value) {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    refreshBtn.addEventListener('click', fetchRates);
    markupInput.addEventListener('input', calculateValues);

    // Initial fetch
    fetchRates();
});
