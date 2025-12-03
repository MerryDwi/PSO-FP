(function () {
  // ============================
  // ELEMENTS
  // ============================
  const openBtn = document.getElementById("leaderboard-button");
  const closeBtn = document.getElementById("close-leaderboard");
  const modal = document.getElementById("leaderboard-full");

  const avatarImg = document.getElementById("profile-avatar");
  const emailText = document.getElementById("profile-email");
  const rankText = document.getElementById("profile-rank");

  const tableBody = document.getElementById("leaderboard-body");


  // ============================
  // FORMATTER
  // ============================
  function formatTime(sec) {
    if (!sec) return "0 sec";
    if (sec < 60) return `${sec} sec`;
    return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  }


  // ============================
  // GET CURRENT USER EMAIL
  // Firebase Auth siap *setelah* onAuthStateChanged
  // ============================
  function getCurrentUserEmail() {
    return new Promise((resolve) => {
      const auth = window.firebaseAuth;

      if (!auth) return resolve(null);

      // Kalau sudah ready
      if (auth.currentUser) return resolve(auth.currentUser.email);

      // Tunggu sampai Firebase Auth siap
      const unsub = auth.onAuthStateChanged((user) => {
        unsub();
        resolve(user?.email || null);
      });
    });
  }


  // ============================
  // LOAD LEADERBOARD FROM FIRESTORE
  // ============================
  async function loadLeaderboardUI() {
    if (!window.leaderboardService) {
      console.error("Leaderboard service belum siap");
      return;
    }

    const data = await window.leaderboardService.getLeaderboard(10);

    // ============================
    // HEADER USER LOGIN
    // ============================
    const userEmail = await getCurrentUserEmail();
    emailText.textContent = userEmail || "Anonymous";

    const auth = window.firebaseAuth;
    if (auth?.currentUser?.photoURL) {
      avatarImg.src = auth.currentUser.photoURL;
    }

    // ============================
    // DISPLAY DATA LEADERBOARD
    // ============================
    if (data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;color:white">
            Tidak ada data leaderboard
          </td>
        </tr>`;
      return;
    }

    // Rank di header (selalu user paling atas)
    const top = data[0];
    rankText.textContent = `Leaderboard : ${top.rank}st`;

    // ============================
    // TABLE CONTENT
    // ============================
    let html = "";

    data.forEach((item) => {
      html += `
        <tr>
          <td>${item.rank}st</td>
          <td>${item.userEmail}</td>
          <td>${item.winCount}</td>
          <td>${item.loseCount}</td>
          <td>${item.drawCount}</td>
          <td>${formatTime(item.totalGameTime)}</td>
          <td>${item.winCount}</td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }


  // ============================
  // EVENT OPEN MODAL
  // ============================
  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    loadLeaderboardUI();
  });


  // ============================
  // EVENT CLOSE MODAL
  // ============================
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

})();
