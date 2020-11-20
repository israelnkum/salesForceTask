
window.onload = function() {
    const oldItems = JSON.parse(localStorage.getItem('productInfo'));
    if (oldItems == null){
        localStorage.setItem('productInfo', JSON.stringify([]));
        localStorage.setItem('qty',0);
        localStorage.setItem('price',0);
    }

    readCartData();
    // setCartQty();
    multInputs();
    setPriceAndQty(oldItems);
}

$(document).ready(function () {
    const oldItems = JSON.parse(localStorage.getItem('productInfo'));

    for (let i = 0; i < $('.colors').length; i++){
        $('.colors')[i].addEventListener('click',function () {
            $('.active-color').removeClass('active-color');
            $('.color-error').removeClass('text-danger');
            this.classList.add('active-color');
            $('.chosen-color').text($(this).text());
            checkSizeAndColor();
        });
    }
    for (let i = 0; i < $('.sizes').length; i++){
        $('.sizes')[i].addEventListener('click',function () {
            $('.active-size').removeClass('active-size');
            this.classList.add('active-size');
            $('#chosen-size').text($(this).text());
            $('#chosen-size').addClass('d-none');
            checkSizeAndColor();
        });
    }
    // a loop to go through all the thumbnails
    for (let i = 0; i < $('.thumbnail').length; i++){
        //add mouseover event to image at a specific index
        $('.thumbnail')[i].addEventListener('mouseover',function () {
            // if there is any existing active image, then remove it
            $('.active-image').removeClass('active-image');
            // add the active class to the current hovered image
            this.classList.add('active-image');

            // set the value of featured-img to the current hovered image
            document.getElementById('featured-img').src = this.src
        });
    }
    $('#increase-qty').click(function() {
        $('#qty').val(parseInt($('#qty').val()) + 1 );
    });
    $('#decrease-qty').click(function() {
        if ($('#qty').val() <= 1){
            $('#qty').val(1);
        }else{
            $('#qty').val(parseInt($('#qty').val()) - 1 );
        }
    });

    $('.close-sidebar').click(function () {
        document.getElementById("mySidebar").style.width = "0";
    });

    $('#btn-add-to-cart').click(function () {

        if ($('.chosen-color').text() === '' || $('.chosen-color').text() === 'Choose a color'){
            $('.chosen-color').text('Choose a color');
            $('.color-error').addClass('text-danger');
        }else{
            $('.color-error').removeClass('text-danger');
        }

        if ($('#chosen-size').text() === '' || $('#chosen-size').text() === 'Choose a size'){
            $('#chosen-size').text('Choose a size');
            $('#chosen-size').addClass('text-danger');
        }else{
            $('#chosen-size').removeClass('text-danger');
        }

        const existingItem = oldItems.find(({ size }) => size === $('#chosen-size').text());
        if (existingItem) {
            Object.assign(existingItem, {
                'id' : $('#item_id').text(),
                'name': $('#product-name').text(),
                'quantity': parseInt(existingItem.quantity) + parseInt($('#qty').val()),
                'price':  $('#product-price').text(),
                'size': $('#chosen-size').text(),
                'color': $('#chosen-color').text(),
            });
        } else {
            const newItem = {
                'id' : $('#item_id').text(),
                'name': $('#product-name').text(),
                'quantity': parseInt($('#qty').val()),
                'price':  $('#product-price').text(),
                'size': $('#chosen-size').text(),
                'color': $('#chosen-color').text(),
            };
            oldItems.push(newItem);
        }
        localStorage.setItem('productInfo', JSON.stringify(oldItems));
        setPriceAndQty(oldItems);
        setCartQty();
        openSideBar();
        getLastItemInCart(oldItems)
    });

    $('#cart-icon').click(function () {
        const oldItems = JSON.parse(localStorage.getItem('productInfo'));

        (oldItems == null) ? alert('Your Cart is Empty') : openSideBar();
    })

    $('#btn-continue-shopping').click(function () {
        document.getElementById("mySidebar").style.width = "0";
    })
    // getLastItemInCart(oldItems);


    $(".txtMult input").keyup(multInputs);
    $(".txtMult input").click(multInputs);
    $(".txtMult input").hover(multInputs);
    $(".deductQty").click(function () {
        let cartitem = $(this).closest(".txtMult");
        let quantity = parseFloat(cartitem.find('.val2').val());
        (quantity <= 1) ? quantity = 1 :  quantity =   quantity - 1;

        cartitem.find('.qtyChanged').val( quantity);
        multInputs();
    });

    $('.addQty').click(function() {
        let cartitem = $(this).closest(".txtMult");
        let quantity = parseFloat(cartitem.find('.val2').val());
        cartitem.find('.qtyChanged').val( quantity+1);
        multInputs();
    });

    $('.btn-apply-coupon').click(function() {
        if ( checkCouponValidity() === true){
            let mult = 0;
            // for each row:
            $("tr.txtMult").each(function () {

                let unit_price = parseFloat($('.unit_price', this).val());
                let couponValue = (unit_price) * (0.5);
                $('.unit_price', this).val(couponValue);
                $('.you-saved', this).text('you saved $'+couponValue)
                let newUnitPrice = parseFloat($('.unit_price', this).val());
                let val2 = parseFloat($('.val2', this).val());
                let total = (newUnitPrice) * (val2);

                $('.multTotal',this).text(Number(total).toFixed(2));
                mult += total;
            });
            $('.subTotal').text(Number(mult).toFixed(2));
            deactivateElement();
        }else{
            $('#coupon-error').text('Enter a valid coupon');
        }

    });


})

function getLastItemInCart(items) {
    if (items.length === 0){
        $('.subTotal').text('0.00')
    }else{
        let lastItem = items[items.length-1];
        $('#lastItemSize').text(lastItem.size);
        $('#lastItemQty').text(lastItem.quantity);
        $('#lastItemColor').text(lastItem.color);
        let cartPrice = localStorage.getItem('price');
        $('.subTotal').text(cartPrice)
    }
}

function openSideBar() {
    document.getElementById("mySidebar").style.width = "350px";
}

function setCartQty() {
    let cartQty = localStorage.getItem('qty');
    $('.cart-qty').text((cartQty) ? cartQty : 0);
}

function checkSizeAndColor() {
    if ($('#chosen-size').text() === '' || $('.chosen-color').text() === '') {
        $('#btn-add-to-cart').attr('disabled','disabled');
    }else{
        $('#btn-add-to-cart').removeAttr('disabled');
    }
}
function readCartData(){
    const items = JSON.parse(localStorage.getItem('productInfo'));
    let cartItems = $('#cart-table-body');
    cartItems.innerHTML = '';
    if (items != null) {
        let html = '';
        let i = 1;
        $.each(items, function (key, value) {
            html += '<tr class="txtMult">';
            html +=
                '<td>' +
                '<img src="asset/img/sweats/sweat_1.jpg" class="img-fluid cart-thumbnail" alt="">' +
                '</td>';
            html += '<td> <a href="index.html">'+ value.name+'</a> <br>' +
                '<small><span class="text-focus">Color:</span> ' + value.color
                +'  <span class="text-focus">Size:</span> '+ value.size +'</small> <br>' +
                '<a href="javascript:void(0)" onclick="deleteItemFromCart('+key+')" class="small text-danger"><i class="fa fa-trash"></i> Delete</a>' +
                '</td>';
            html += '<td>' +
                '<div class="input-group input-group-sm w-50">\n' +
                '<div class="input-group-prepend deductQty"><span class="input-group-text">-</span></div>\n' +
                '<input type="text" class="form-control val2 qtyChanged" id="qty" value="'+value.quantity+'">\n' +
                '<div class="input-group-prepend addQty"><span class="input-group-text border-left-0">+</span>\n' +
                '</div></div></td>';
            html += '<td >$' + value.price + ' <input type="hidden" class="unit_price" value="' + value.price + '"> <br> <small class="text-danger you-saved"></small></td>';
            // html += '<td>$' +value.quantity * value.price + '</td>';
            html += '<td class="multTotal">$' +value.quantity * value.price + '</td>';
            i++;
        });
        $('#cart-table > tbody').html(html);
    }
}

function deleteItemFromCart(id){
    const oldItems = JSON.parse(localStorage.getItem('productInfo'));
    delete oldItems.splice(id, 1);
    localStorage.setItem('productInfo', JSON.stringify(oldItems));
    setPriceAndQty(oldItems)
    readCartData();
    setCartQty();
}

function setPriceAndQty(items) {
    let totalQty = 0;
    let totalPrice = 0;
    $.each(items, function(key,value) {
        totalQty += value.quantity
        totalPrice += (value.price * value.quantity)
    });
    localStorage.setItem('qty',totalQty);
    localStorage.setItem('price',totalPrice);
    $('.cart-qty').text((totalQty) ? totalQty : 0);
    $('.subTotal').text(totalPrice)
}

function multInputs() {
    let mult = 0;
    // for each row:
    $("tr.txtMult").each(function () {
        // get the values from this row:
        let unit_price = parseFloat($('.unit_price', this).val());
        let val2 = parseFloat($('.val2', this).val());
        let total = (unit_price) * (val2);
        $('.multTotal',this).text(Number(total).toFixed(2));
        mult += total;
    });
    $('.subTotal').text(Number(mult).toFixed(2))
}



function checkCouponValidity() {
    let coupon = $("#coupon").val();
    return !(coupon.length < 5 || coupon.length > 5);
}

function deactivateElement() {
    $('#coupon-error').text('');
    $('.btn-apply-coupon').attr('disabled','disabled');
    $('#coupon').attr('disabled','disabled');
    $('.qtyChanged').attr('disabled','disabled');
    $('.addQty').fadeOut(1000).slideUp(1000);
    $('.deductQty').fadeOut(1000).slideUp(1000);
}
