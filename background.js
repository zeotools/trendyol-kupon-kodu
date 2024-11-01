let lastPubDate = null; // Son gönderinin tarihini saklar

async function checkRSSFeed() {
    const startTime = performance.now(); // Başlangıç zamanını al

    try {
        const response = await fetch("https://enuygunfirmalar.com/forums/trendyol-indirim-kuponu.49/index.rss");

        // CORS hatasını önlemek için uygun şekilde yanıt kontrolü
        if (!response.ok) {
            throw new Error("Ağ yanıtı başarısız: " + response.status);
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        const latestItem = xmlDoc.querySelector("item");
        const pubDate = latestItem.querySelector("pubDate").textContent;

        if (lastPubDate !== pubDate) {
            lastPubDate = pubDate;
            const title = latestItem.querySelector("title").textContent;
            const link = latestItem.querySelector("link").textContent;

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Yeni Trendyol İndirim Kuponu!",
                message: title,
                buttons: [{ title: "Kuponu Gör" }],
                requireInteraction: true
            });

            chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
                if (btnIdx === 0) {
                    chrome.tabs.create({ url: link });
                }
            });
        }
    } catch (error) {
        console.error("RSS akışı kontrol edilirken hata oluştu:", error);
        // Hata durumunda kullanıcıya bildirim göndermek isteyebilirsiniz
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Hata!",
            message: "RSS akışı kontrol edilirken bir hata oluştu: " + error.message,
            priority: 2
        });
    } finally {
        const endTime = performance.now(); // Bitiş zamanını al
        const duration = endTime - startTime; // Süreyi hesapla
        console.log(`RSS akışı kontrol süresi: ${duration.toFixed(2)} ms`); // Konsola yazdır
    }
}

// Saklanan sıklığı kullanarak arka plan süresini günceller
chrome.storage.sync.get("frequency", (data) => {
    const frequency = data.frequency || 5; // Varsayılan olarak 5 dakika
    setInterval(checkRSSFeed, frequency * 60 * 1000);
});

// İlk kontrolü yap
checkRSSFeed();
