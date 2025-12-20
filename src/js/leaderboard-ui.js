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
    try {
      if (!window.leaderboardService) {
        throw new Error("Leaderboard service belum siap");
      }

      const data = await window.leaderboardService.getLeaderboard(7);

      // ============================
      // HEADER USER LOGIN
      // ============================
      const userEmail = await getCurrentUserEmail();
      emailText.textContent = userEmail || "Anonymous";

      // Set foto profil dari file photo_profile.png
      avatarImg.src = "./src/images/photo_profile.png";

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

      // Cari rank user yang sedang login
      const userRank = data.find((item) => item.userEmail === userEmail);
      if (userRank) {
        const suffix = getRankSuffix(userRank.rank);
        rankText.textContent = `Leaderboard : ${userRank.rank}${suffix}`;
      } else {
        rankText.textContent = `Leaderboard : Not Ranked`;
      }

      // ============================
      // TABLE CONTENT WITH PROFILE PHOTOS
      // ============================
      let html = "";

      data.forEach((item) => {
        const suffix = getRankSuffix(item.rank);

        html += `
          <tr>
            <td>${item.rank}${suffix}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img 
                  src="./src/images/photo_profile.png" 
                  alt="${item.userEmail}"
                  class="avatar-gradient"
                  onerror="this.src='./src/images/default-avatar.png'"
                />
                <span>${item.userEmail}</span>
              </div>
            </td>
            <td>${item.winCount}</td>
            <td>${item.loseCount}</td>
            <td>${item.drawCount}</td>
            <td>${formatTime(item.totalGameTime)}</td>
            <td>${item.totalScore}</td>
          </tr>
        `;
      });

      tableBody.innerHTML = html;
    } catch (error) {
      throw new Error(`Failed to load leaderboard UI: ${error.message}`);
    }
  }

  // ============================
  // HELPER: GET RANK SUFFIX
  // ============================
  function getRankSuffix(rank) {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  }

  // ============================
  // EVENT OPEN MODAL
  // ============================
  openBtn.addEventListener("click", () => {
    try {
      modal.style.display = "flex";
      loadLeaderboardUI().catch((error) => {
        // Wrap error as exception but don't break UI
        const exception = new Error(
          `Failed to open leaderboard modal: ${error.message}`
        );
        console.error("Error loading leaderboard:", exception);
        // Show error message to user
        if (tableBody) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align:center;color:red">
                Error loading leaderboard: ${error.message}
              </td>
            </tr>`;
        }
      });
    } catch (error) {
      // Wrap error as exception but don't break UI
      const exception = new Error(
        `Failed to handle leaderboard button click: ${error.message}`
      );
      console.error("Error handling leaderboard button:", exception);
    }
  });

  // ============================
  // EVENT CLOSE MODAL
  // ============================
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
})();
