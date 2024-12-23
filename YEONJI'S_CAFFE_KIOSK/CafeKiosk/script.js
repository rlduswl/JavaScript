document.addEventListener("DOMContentLoaded", () => {
            const menuItems = document.querySelectorAll(".menu-item");
            const cartList = document.querySelector(".cart-items");
            const totalPriceEl = document.getElementById("total-price");
            const checkoutBtn = document.getElementById("checkout-btn");
            const clearCartBtn = document.getElementById("clear-cart");
            const adminBtn = document.getElementById("admin-btn");
            const adminModal = document.getElementById("admin-modal");
            const closeAdminModalBtn = document.getElementById("close-admin-modal");
            const addMenuBtn = document.getElementById("add-menu");
            const newMenuName = document.getElementById("new-menu-name");
            const newMenuPrice = document.getElementById("new-menu-price");
            const newMenuCategory = document.getElementById("new-menu-category");
            const newMenuImage = document.getElementById("new-menu-image");
            const salesList = document.getElementById("sales-list");
            const totalSalesEl = document.getElementById("total-sales");
            const clearSalesBtn = document.getElementById("clear-sales");
            const paymentModal = document.getElementById("payment-modal");
            const cardPayment = document.getElementById("card-payment");
            const simplePayment = document.getElementById("simple-payment");
            const cardModal = document.getElementById("card-modal");
            const simpleModal = document.getElementById("simple-modal");
            const cardConfirm = document.getElementById("card-confirm");
            const simpleConfirm = document.getElementById("simple-confirm");
            const receiptModal = document.getElementById("receipt-modal");
            const receiptContent = document.getElementById("receipt-content");
            const receiptClose = document.getElementById("receipt-close");

            let totalPrice = 0;
            let totalSales = 0;

            // 카테고리 필터링
            const categoryButtons = document.querySelectorAll(".tab-btn");
            categoryButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    const selectedCategory = button.dataset.category;

                    categoryButtons.forEach((btn) => btn.classList.remove("active"));
                    button.classList.add("active");

                    document.querySelectorAll(".menu-item").forEach((item) => {
                        if (
                            selectedCategory === "all" ||
                            item.dataset.category === selectedCategory
                        ) {
                            item.style.display = "block";
                        } else {
                            item.style.display = "none";
                        }
                    });
                });
            });

            function initializeDragAndDrop(item) {
                item.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData(
                        "text/plain",
                        JSON.stringify({
                            name: item.dataset.name,
                            price: parseInt(item.dataset.price, 10),
                            category: item.dataset.category,
                            imgSrc: item.querySelector("img").src,
                        })
                    );
                });
            }

            // 드래그 앤 드롭 초기화
            menuItems.forEach(initializeDragAndDrop);

            const cartArea = document.querySelector(".cart-area");
            cartArea.addEventListener("dragover", (e) => e.preventDefault());
            cartArea.addEventListener("drop", (e) => {
                e.preventDefault();
                const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                addToCart(data);
                hideMenuItem(data.name);
            });

            const menuGrid = document.querySelector(".menu-grid");
            menuGrid.addEventListener("dragover", (e) => e.preventDefault());
            menuGrid.addEventListener("drop", (e) => {
                e.preventDefault();
                const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                removeFromCart(data.name);
                showMenuItem(data.name);
            });

            function hideMenuItem(name) {
                const menuItem = document.querySelector(`.menu-item[data-name="${name}"]`);
                if (menuItem) {
                    menuItem.style.display = "none";
                }
            }

            function showMenuItem(name) {
                const menuItem = document.querySelector(`.menu-item[data-name="${name}"]`);
                if (menuItem) {
                    menuItem.style.display = "block";
                }
            }

            function addToCart(data) {
                const existingItem = Array.from(cartList.children).find(
                    (item) => item.dataset.name === data.name
                );
                if (existingItem) {
                    alert("이미 장바구니에 추가된 항목입니다.");
                    return;
                }

                const cartItem = document.createElement("div");
                cartItem.classList.add("cart-item");
                cartItem.dataset.name = data.name;
                cartItem.setAttribute("draggable", "true");
                cartItem.innerHTML = `
              <img src="${data.imgSrc}" alt="${data.name}" />
              <p class="item-name">${data.name}</p>
              <p class="item-price">${data.price}원</p>
              <div>
                  <label for="quantity-${data.name}">수량:</label>
                  <input type="number" id="quantity-${data.name}" value="1" min="1" class="quantity-input" />
              </div>
              <button class="remove-btn">삭제</button>
          `;

                const removeBtn = cartItem.querySelector(".remove-btn");
                removeBtn.addEventListener("click", () => {
                    cartList.removeChild(cartItem);
                    showMenuItem(data.name);
                    updateTotalPrice();
                });

                const quantityInput = cartItem.querySelector(".quantity-input");
                quantityInput.addEventListener("change", updateTotalPrice);

                cartItem.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", JSON.stringify({ name: data.name }));
                });

                cartList.appendChild(cartItem);
                updateTotalPrice();
            }

            function removeFromCart(name) {
                const cartItem = cartList.querySelector(`.cart-item[data-name="${name}"]`);
                if (cartItem) {
                    cartList.removeChild(cartItem);
                    updateTotalPrice();
                }
            }

            function updateTotalPrice() {
                totalPrice = Array.from(cartList.children).reduce((acc, cartItem) => {
                    const quantity = parseInt(
                        cartItem.querySelector(".quantity-input").value,
                        10
                    );
                    const price = parseInt(
                        cartItem.querySelector(".item-price").textContent.replace("원", ""),
                        10
                    );
                    return acc + price * quantity;
                }, 0);
                totalPriceEl.textContent = totalPrice;
            }

            clearCartBtn.addEventListener("click", () => {
                Array.from(cartList.children).forEach((item) => {
                    showMenuItem(item.dataset.name);
                });
                cartList.innerHTML = "";
                updateTotalPrice();
            });

            // 결제 및 영수증 표시
            checkoutBtn.addEventListener("click", () => {
                if (!cartList.children.length) {
                    alert("장바구니가 비어 있습니다!");
                    return;
                }
                paymentModal.classList.remove("hidden");
            });

            cardPayment.addEventListener("click", () => {
                paymentModal.classList.add("hidden");
                cardModal.classList.remove("hidden");
            });

            simplePayment.addEventListener("click", () => {
                paymentModal.classList.add("hidden");
                simpleModal.classList.remove("hidden");
            });

            cardConfirm.addEventListener("click", () => {
                showReceipt("카드");
                completePayment();
            });

            simpleConfirm.addEventListener("click", () => {
                showReceipt("간편결제");
                completePayment();
            });

            function completePayment() {
                const receiptItems = Array.from(cartList.children).map((item) => {
                    const name = item.querySelector(".item-name").textContent;
                    const price = item.querySelector(".item-price").textContent;
                    const quantity = item.querySelector(".quantity-input").value;
                    return `${name} x ${quantity}개 - ${price}`;
                });

                salesList.innerHTML += `<li>${new Date().toLocaleString()} - ${receiptItems.join(
      ", "
    )} | 총액: ${totalPrice}원</li>`;
                totalSales += totalPrice;
                totalSalesEl.textContent = `${totalSales}원`;

                clearCartBtn.click();
                paymentModal.classList.add("hidden");
                cardModal.classList.add("hidden");
                simpleModal.classList.add("hidden");
            }

            function showReceipt(paymentMethod) {
                receiptContent.innerHTML = `
          <h2>영수증</h2>
          <p>결제 방식: ${paymentMethod}</p>
          <ul>
            ${Array.from(cartList.children)
              .map((item) => {
                const name = item.querySelector(".item-name").textContent;
                const price = item.querySelector(".item-price").textContent;
                const quantity = item.querySelector(".quantity-input").value;
                return `<li>${name} x ${quantity}개 - ${price}</li>`;
              })
              .join("")}
          </ul>
          <p>총 금액: ${totalPrice}원</p>
        `;
    receiptModal.classList.remove("hidden");

    setTimeout(() => {
      receiptModal.classList.add("hidden");
      clearCartBtn.click();
    }, 3000);
  }

  receiptClose.addEventListener("click", () => {
    receiptModal.classList.add("hidden");
  });

  // 관리자 기능 열고 닫기
  adminBtn.addEventListener("click", () => {
    adminModal.classList.remove("hidden");
  });

  closeAdminModalBtn.addEventListener("click", () => {
    adminModal.classList.add("hidden");
  });

  // 메뉴 추가 기능
  addMenuBtn.addEventListener("click", () => {
    const name = newMenuName.value.trim();
    const price = parseInt(newMenuPrice.value, 10);
    const category = newMenuCategory.value.trim();
    const imageFile = newMenuImage.files[0];

    if (name && !isNaN(price) && category && imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const menuItem = document.createElement("div");
        menuItem.classList.add("menu-item");
        menuItem.dataset.category = category;
        menuItem.dataset.name = name;
        menuItem.dataset.price = price;
        menuItem.setAttribute("draggable", "true");
        menuItem.innerHTML = `
              <img src="${reader.result}" alt="${name}" />
              <p class="item-name">${name}</p>
              <p class="item-price">${price}원</p>
            `;

        initializeDragAndDrop(menuItem);
        document.querySelector(".menu-grid").appendChild(menuItem);
        alert("메뉴가 추가되었습니다!");
      };
      reader.readAsDataURL(imageFile);
    } else {
      alert("올바른 메뉴 정보를 입력하세요.");
    }

    newMenuName.value = "";
    newMenuPrice.value = "";
    newMenuCategory.value = "";
    newMenuImage.value = "";
  });

  clearSalesBtn.addEventListener("click", () => {
    salesList.innerHTML = "";
    totalSales = 0;
    totalSalesEl.textContent = "0원";
  });
});