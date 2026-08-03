(() => {
  "use strict";

  function iniciarSite() {
    const config = window.CLIENTE_CONFIG || {};

    const normalizarUrl = (valor) => {
      const texto = String(valor || "").trim();
      if (!texto) return "";
      return /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
    };

    const configurarLink = (nome, href) => {
      const elemento = document.querySelector(`[data-link="${nome}"]`);
      if (!elemento || !href) return;

      elemento.href = href;
      elemento.style.pointerEvents = "auto";
      elemento.removeAttribute("aria-disabled");
      elemento.setAttribute("tabindex", "0");
    };

    configurarLink("imoveis", normalizarUrl(config.imoveis));

    const numero = String(config.whatsappNumero || "").replace(/\D/g, "");
    if (numero) {
      const mensagem = encodeURIComponent(config.whatsappMensagem || "");
      configurarLink(
        "whatsapp",
        `https://wa.me/${numero}${mensagem ? `?text=${mensagem}` : ""}`
      );
    }

    const email = String(config.email || "").trim();
    if (email) {
      const assunto = encodeURIComponent(config.emailAssunto || "");
      configurarLink(
        "email",
        `mailto:${email}${assunto ? `?subject=${assunto}` : ""}`
      );
    }

    configurarLink("instagram", normalizarUrl(config.instagram));

    if ("serviceWorker" in navigator) {
      window.addEventListener(
        "load",
        () => {
          navigator.serviceWorker.register("./sw.js").catch((erro) => {
            console.error("Falha ao registrar o Service Worker:", erro);
          });
        },
        { once: true }
      );
    }

    let installPrompt = null;
    const installButton = document.getElementById("installApp");
    const iosInstallModal = document.getElementById("iosInstallModal");
    const closeIosInstall = document.getElementById("closeIosInstall");

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isIos && !isStandalone && installButton) {
      installButton.hidden = false;
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      if (installButton) installButton.hidden = false;
    });

    installButton?.addEventListener("click", async () => {
      if (isIos) {
        if (iosInstallModal) iosInstallModal.hidden = false;
        return;
      }

      if (!installPrompt) return;

      await installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      installButton.hidden = true;
    });

    closeIosInstall?.addEventListener("click", () => {
      if (iosInstallModal) iosInstallModal.hidden = true;
    });

    iosInstallModal?.addEventListener("click", (event) => {
      if (event.target === iosInstallModal) {
        iosInstallModal.hidden = true;
      }
    });

    window.addEventListener("appinstalled", () => {
      installPrompt = null;
      if (installButton) installButton.hidden = true;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarSite, { once: true });
  } else {
    iniciarSite();
  }
})();
