document.addEventListener("DOMContentLoaded", () => {
            const menuItems = document.querySelectorAll(".menu-item");
            const cartList = document.querySelector(".cart-list");
            const cartArea = document.querySelector(".cart-area");
            const totalPriceEl = document.querySelector(".total-price");
            const checkoutBtn = document.getElementById("checkout-btn");
            const adminBtn = document.getElementById("admin-btn");
            const adminModal = document.getElementById("admin-modal");
            const closeModal = document.getElementById("close-modal");
            const salesList = document.getElementById("sales-list");
            const totalSalesEl = document.getElementById("total-sales");
            const clearSalesBtn = document.getElementById("clear-sales");
            const addMenuBtn = document.getElementById("add-menu");
            const newMenuName = document.getElementById("new-menu-name");
            const newMenuPrice = document.getElementById("new-menu-price");
            const newMenuCategory = document.getElementById("new-menu-category");
            const paymentModal = document.getElementById("payment-modal");
            const cardPayment = document.getElementById("card-payment");
            const simplePayment = document.getElementById("simple-payment");
            const cardModal = document.getElementById("card-modal");
            const simpleModal = document.getElementById("simple-modal");
            const cardConfirm = document.getElementById("card-confirm");
            const simpleConfirm = document.getElementById("simple-confirm");

            let totalPrice = 0;
            let totalSales = 0;

            // 카테고리 필터링
            const categoryButtons = document.querySelectorAll(".category-btn");
            categoryButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    const category = button.dataset.category;
                    filterMenuItems(category);
                });
            });

            function filterMenuItems(category) {
                menuItems.forEach((item) => {
                    if (category === "all" || item.dataset.category === category) {
                        if (!item.classList.contains("in-cart")) {
                            item.style.display = "block";
                        }
                    } else {
                        item.style.display = "none";
                    }
                });
            }

            // 드래그 시작 이벤트
            menuItems.forEach((item) => {
                item.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData(
                        "text/plain",
                        JSON.stringify({
                            name: item.dataset.name,
                            price: parseInt(item.dataset.price, 10),
                            category: item.dataset.category,
                            imgSrc: item.querySelector("img").src,
                            id: item.dataset.name,
                        })
                    );
                });
            });

            // 장바구니 드래그 활성화
            cartArea.addEventListener("dragover", (e) => e.preventDefault());
            cartArea.addEventListener("drop", (e) => {
                e.preventDefault();
                const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                addCartItem(data.name, data.price, data.category, data.imgSrc, data.id);
            });

            // 장바구니에서 키오스크로 드래그 활성화
            document
                .querySelector(".menu-area")
                .addEventListener("dragover", (e) => e.preventDefault());
            document.querySelector(".menu-area").addEventListener("drop", (e) => {
                e.preventDefault();
                const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                removeCartItem(data.id);
            });

            // 장바구니에 항목 추가
            function addCartItem(name, price, category, imgSrc, id) {
                const existingItem = [...cartList.children].find(
                    (item) => item.dataset.id === id
                );
                if (existingItem) {
                    alert("이미 장바구니에 있는 항목입니다.");
                    return;
                }

                const cartItem = document.createElement("div");
                cartItem.classList.add("cart-item");
                cartItem.setAttribute("data-id", id);
                cartItem.setAttribute("draggable", true);

                cartItem.innerHTML = `
      <img src="${imgSrc}" alt="${name}" class="cart-item-img" />
      <div class="cart-item-details">
        <p>${name}</p>
        <p>${price}원</p>
        <div class="cart-item-controls">
          <label for="quantity-${id}">수량:</label>
          <input type="number" id="quantity-${id}" value="1" min="1" class="cart-quantity" />
        </div>
      </div>
      ${
        category === "coffee"
          ? `<div class="cart-item-select">
              <label for="type-${id}">종류:</label>
              <select id="type-${id}" class="cart-coffee-type">
                <option value="iced">아이스</option>
                <option value="hot">핫</option>
              </select>
            </div>`
          : ""
      }
      <button class="remove-btn">삭제</button>
    `;

    cartItem.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ id: cartItem.dataset.id })
      );
    });

    const removeBtn = cartItem.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      removeCartItem(id);
    });

    cartList.appendChild(cartItem);
    document
      .querySelector(`.menu-item[data-name="${id}"]`)
      .classList.add("in-cart");
    updateTotalPrice();
  }

  // 장바구니에서 항목 제거
  function removeCartItem(id) {
    const cartItem = cartList.querySelector(`.cart-item[data-id="${id}"]`);
    if (cartItem) {
      cartList.removeChild(cartItem);
      document
        .querySelector(`.menu-item[data-name="${id}"]`)
        .classList.remove("in-cart");
      updateTotalPrice();
    }
  }

  // 총액 업데이트
  function updateTotalPrice() {
    totalPrice = [...cartList.children].reduce((acc, item) => {
      const quantity = item.querySelector(".cart-quantity").value;
      const price = parseInt(
        item.querySelector(".cart-item-details p:nth-child(2)").textContent,
        10
      );
      return acc + price * quantity;
    }, 0);
    totalPriceEl.textContent = `총액: ${totalPrice}원`;
  }

  // 결제 버튼 클릭 시 결제 모달 열기
  checkoutBtn.addEventListener("click", () => {
    if (totalPrice === 0) {
      alert("장바구니가 비어 있습니다!");
      return;
    }
    paymentModal.classList.remove("hidden");
  });

  // 카드 결제 선택
  cardPayment.addEventListener("click", () => {
    paymentModal.classList.add("hidden");
    cardModal.classList.remove("hidden");
  });

  // 간편결제 선택
  simplePayment.addEventListener("click", () => {
    paymentModal.classList.add("hidden");
    simpleModal.classList.remove("hidden");
  });

  // 카드 결제 확인
  cardConfirm.addEventListener("click", () => {
    alert("카드 결제가 완료되었습니다!");
    completePayment();
    cardModal.classList.add("hidden");
  });

  // 간편결제 확인
  simpleConfirm.addEventListener("click", () => {
    alert("간편결제가 완료되었습니다!");
    completePayment();
    simpleModal.classList.add("hidden");
  });

  // 결제 완료 처리
  function completePayment() {
    totalSales += totalPrice;
    salesList.innerHTML += `<li>${new Date().toLocaleString()} - ${totalPrice}원</li>`;
    totalSalesEl.textContent = `총 판매 금액: ${totalSales}원`;
    resetCart();
  }

  // 장바구니 초기화
  function resetCart() {
    cartList.innerHTML = "";
    totalPrice = 0;
    updateTotalPrice();
    document
      .querySelectorAll(".menu-item")
      .forEach((item) => item.classList.remove("in-cart"));
  }

  // 관리자 버튼 클릭
  adminBtn.addEventListener("click", () =>
    adminModal.classList.remove("hidden")
  );
  closeModal.addEventListener("click", () =>
    adminModal.classList.add("hidden")
  );

  // 판매 내역 초기화
  clearSalesBtn.addEventListener("click", () => {
    salesList.innerHTML = "";
    totalSales = 0;
    totalSalesEl.textContent = `총 판매 금액: 0원`;
  });

  // 메뉴 추가
  addMenuBtn.addEventListener("click", () => {
    const name = newMenuName.value.trim();
    const price = parseInt(newMenuPrice.value, 10);
    const category = newMenuCategory.value.trim();

    if (name && !isNaN(price) && category) {
      const menuItem = document.createElement("div");
      menuItem.classList.add("menu-item");
      menuItem.setAttribute("draggable", true);
      menuItem.dataset.category = category;
      menuItem.dataset.name = name;
      menuItem.dataset.price = price;
      menuItem.innerHTML = `
        <img src="placeholder.png" alt="${name}" />
        <p>${name} - ${price}원</p>
      `;
      menuItem.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            name: menuItem.dataset.name,
            price: parseInt(menuItem.dataset.price, 10),
            category: menuItem.dataset.category,
            imgSrc: menuItem.querySelector("img").src,
          })
        );
      });
      document.querySelector(".menu-area").appendChild(menuItem);
      alert("메뉴가 추가되었습니다.");
    } else {
      alert("올바른 메뉴 정보를 입력하세요.");
    }

    newMenuName.value = "";
    newMenuPrice.value = "";
    newMenuCategory.value = "";
  });
});