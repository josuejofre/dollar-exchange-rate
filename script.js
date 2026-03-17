document.addEventListener('DOMContentLoaded', () => {
    const awesomeBid = document.getElementById('awesome-bid');
    const awesomeAsk = document.getElementById('awesome-ask');
    const awesomeVarbid = document.getElementById('awesome-varbid');
    const awesomeHigh = document.getElementById('awesome-high');
    const awesomeLow = document.getElementById('awesome-low');
    const awesomeTimestamp = document.getElementById('awesome-timestamp');

    const binanceLast = document.getElementById('binance-last');
    const binanceChange = document.getElementById('binance-change');
    const binanceVolume = document.getElementById('binance-volume');
    const binanceTimestamp = document.getElementById('binance-timestamp');

    const avgRateEl = document.getElementById('avg-rate');
    const markupInput = document.getElementById('markup-percentage');
    const amountInput = document.getElementById('amount-usd');
    const finalRateEl = document.getElementById('final-rate');
    const finalTotalEl = document.getElementById('final-total');

    const refreshBtn = document.getElementById('refresh-btn');
    const loadingEl = document.getElementById('loading');

    const API1_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';
    const API2_URL = 'https://api.binance.com/api/v3/ticker/24hr?symbol=USDTBRL';

    let awesomeApiRate = 0;
    let binanceApiRate = 0;

    async function fetchRates() {
        loadingEl.style.display = 'block';
        try {
            const [awesomeResponse, binanceResponse] = await Promise.all([
                fetch(API1_URL),
                fetch(API2_URL)
            ]);

            if (!awesomeResponse.ok || !binanceResponse.ok) {
                throw new Error('Erro ao buscar dados das APIs.');
            }

            const awesomeData = await awesomeResponse.json();
            const binanceData = await binanceResponse.json();
            
            // AwesomeAPI
            const { bid, ask, varBid, high, low, create_date } = awesomeData.USDBRL;
            awesomeApiRate = parseFloat(ask);
            awesomeBid.textContent = formatCurrency(bid);
            awesomeAsk.textContent = formatCurrency(ask);
            awesomeVarbid.textContent = varBid;
            awesomeHigh.textContent = formatCurrency(high);
            awesomeLow.textContent = formatCurrency(low);
            awesomeTimestamp.textContent = new Date(create_date).toLocaleString('pt-BR');

            // Binance
            const { lastPrice, volume, priceChangePercent } = binanceData;
            binanceApiRate = parseFloat(lastPrice);
            binanceLast.textContent = formatCurrency(lastPrice);
            binanceChange.textContent = parseFloat(priceChangePercent).toFixed(2);
            binanceVolume.textContent = parseFloat(volume).toFixed(2);
            binanceTimestamp.textContent = new Date().toLocaleString('pt-BR');

            calculateValues();

        } catch (error) {
            console.error(error);
            alert('Não foi possível carregar os dados. Tente novamente.');
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    function calculateValues() {
        if (awesomeApiRate > 0 && binanceApiRate > 0) {
            const average = (awesomeApiRate + binanceApiRate) / 2;
            avgRateEl.textContent = formatCurrency(average);

            const markupPercentage = parseFloat(markupInput.value) || 0;
            const amountUsd = parseFloat(amountInput.value) || 0;

            const rateMarkupValue = average * (markupPercentage / 100);
            const finalRate = average + rateMarkupValue;

            finalRateEl.textContent = formatCurrency(finalRate);

            if (amountUsd > 0 && finalRate > 0) {
                const totalBrl = amountUsd * finalRate;
                finalTotalEl.textContent = parseFloat(totalBrl).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            } else {
                finalTotalEl.textContent = '-';
            }
        }
    }
    
    function formatCurrency(value) {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    refreshBtn.addEventListener('click', fetchRates);
    markupInput.addEventListener('input', calculateValues);
    amountInput.addEventListener('input', calculateValues);

    // Initial fetch
    fetchRates();
});
