document.addEventListener("DOMContentLoaded", () => {
  const frequencyInput = document.getElementById("frequency");

  // Mevcut ayarları yükleyin
  chrome.storage.sync.get("frequency", (data) => {
    if (data.frequency) frequencyInput.value = data.frequency;
  });

  document.getElementById("saveSettings").addEventListener("click", () => {
    const frequency = parseInt(frequencyInput.value);
    chrome.storage.sync.set({ frequency: frequency }, () => {
      // Alarmı güncelleyin
      chrome.alarms.clear("checkRSSFeed", () => {
        chrome.alarms.create("checkRSSFeed", { periodInMinutes: frequency });
      });

      // Başarı mesajı göster
      const successMessage = document.createElement("div");
      successMessage.textContent = "Ayarlar başarıyla kaydedildi!";
      successMessage.style.color = "#4CAF50";
      successMessage.style.marginTop = "10px";
      document.body.appendChild(successMessage);

      // Mesajı 3 saniye sonra kaldırın
      setTimeout(() => successMessage.remove(), 3000);
    });
  });
});
