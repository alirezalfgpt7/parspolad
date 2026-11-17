document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const body = document.body;

    const sidebar =
        document.getElementById("sidebar");

    const collapseBtn =
        document.getElementById("collapseBtn");

    const positionBtn =
        document.getElementById("positionBtn");

    const themeBtn =
        document.getElementById("themeBtn");

    const themeIcon =
        themeBtn.querySelector(".theme-icon i");

    const themeLabel =
        themeBtn.querySelector(".theme-label");

    const submenuTriggers =
        document.querySelectorAll(".submenu-trigger");

    const menuLinks =
        document.querySelectorAll(
            ".menu-item:not(.has-submenu) > .menu-link"
        );


    /* =====================================================
       COLLAPSE SIDEBAR
    ===================================================== */

    collapseBtn.addEventListener("click", () => {

        sidebar.classList.toggle("collapsed");

        /*
         * وقتی سایدبار بسته می‌شود،
         * زیرمنوهای باز نیز بسته می‌شوند.
         */

        if (sidebar.classList.contains("collapsed")) {

            document
                .querySelectorAll(".has-submenu.open")
                .forEach(item => {

                    item.classList.remove("open");

                });

        }

    });


    /* =====================================================
       SUBMENUS
    ===================================================== */

    submenuTriggers.forEach(trigger => {

        trigger.addEventListener("click", () => {

            const parent =
                trigger.closest(".has-submenu");


            /*
             * اگر sidebar بسته باشد،
             * ابتدا آن را باز می‌کنیم
             * و سپس submenu نمایش داده می‌شود.
             */

            if (
                sidebar.classList.contains("collapsed")
            ) {

                sidebar.classList.remove("collapsed");

                setTimeout(() => {

                    openSubmenu(parent);

                }, 160);

                return;
            }


            /*
             * Toggle submenu
             */

            if (parent.classList.contains("open")) {

                parent.classList.remove("open");

            } else {

                openSubmenu(parent);

            }

        });

    });


    /* =====================================================
       OPEN SUBMENU
    ===================================================== */

    function openSubmenu(target) {

        /*
         * فقط یک submenu همزمان باز باشد
         */

        document
            .querySelectorAll(".has-submenu")
            .forEach(item => {

                if (item !== target) {
                    item.classList.remove("open");
                }

            });

        target.classList.add("open");
    }


    /* =====================================================
       ACTIVE MENU
    ===================================================== */

    menuLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            document
                .querySelectorAll(".menu-item.active")
                .forEach(item => {

                    item.classList.remove("active");

                });

            link
                .closest(".menu-item")
                .classList.add("active");

        });

    });


    /* =====================================================
       MOVE SIDEBAR LEFT / RIGHT
    ===================================================== */

    positionBtn.addEventListener("click", () => {

        sidebar.classList.toggle("position-right");

        updatePositionButton();

    });


    function updatePositionButton() {

        const icon =
            positionBtn.querySelector("i");

        const text =
            positionBtn.querySelector(".sidebar-text");


        if (
            sidebar.classList.contains("position-right")
        ) {

            icon.className =
                "bx bx-horizontal-right";

            text.textContent =
                "Move to Left";

        } else {

            icon.className =
                "bx bx-horizontal-left";

            text.textContent =
                "Move to Right";

        }

    }


    /* =====================================================
       DARK / LIGHT MODE
    ===================================================== */

    themeBtn.addEventListener("click", () => {

        body.classList.toggle("dark");

        updateTheme();

    });


    function updateTheme() {

        if (body.classList.contains("dark")) {

            themeIcon.className =
                "bx bx-sun";

            themeLabel.textContent =
                "Light Mode";

        } else {

            themeIcon.className =
                "bx bx-moon";

            themeLabel.textContent =
                "Dark Mode";

        }

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchInput =
        document.querySelector(
            ".search-box input"
        );

    searchInput.addEventListener("input", event => {

        const value =
            event.target.value
                .trim()
                .toLowerCase();


        document
            .querySelectorAll(".menu-item")
            .forEach(item => {

                const title =
                    item.querySelector(
                        ".menu-title"
                    );

                if (!title) {
                    return;
                }

                const text =
                    title.textContent
                        .trim()
                        .toLowerCase();


                if (
                    text.includes(value)
                    || value === ""
                ) {

                    item.style.display = "";

                } else {

                    item.style.display = "none";

                }

            });

    });


    /* =====================================================
       CLICK SEARCH WHILE COLLAPSED
    ===================================================== */

    const searchBox =
        document.querySelector(".search-box");

    searchBox.addEventListener("click", () => {

        if (
            sidebar.classList.contains("collapsed")
        ) {

            sidebar.classList.remove("collapsed");

            setTimeout(() => {

                searchInput.focus();

            }, 180);

        }

    });


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    updateTheme();
    updatePositionButton();

});