const c = (el)=>document.querySelector(el);
const cs = (el)=>document.querySelectorAll(el);

let modalQt = 1;
let modalPrice = 0;
let totalPrice = 0;
let modalKey = 0;
let cart = [];

pizzaJson.map((item, index)=>{

    let pizzaItem = c('.models .pizza-item').cloneNode(true);
    
    pizzaItem.setAttribute('data-key', index);
    pizzaItem.querySelector('.pizza-item--img img').src = item.img;
    pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${item.price[1].toFixed(2)}`;
    pizzaItem.querySelector('.pizza-item--name').innerHTML = item.name;
    pizzaItem.querySelector('.pizza-item--desc').innerHTML = item.description;
    pizzaItem.querySelector('a').addEventListener('click', (e)=>{
        e.preventDefault(); //cancela o evento padrão
        let key = e.target.closest('.pizza-item').getAttribute('data-key'); //retorna o ancestral mais próximo, em relação ao elemento atual.
        modalQt = 1; //sempre vai abrir com 1
        modalPrice = pizzaJson[key].price[2];
        modalKey = key;
        
        c('.pizzaInfo h1').innerHTML = pizzaJson[key].name;
        c('.pizzaInfo--desc').innerHTML = pizzaJson[key].description;
        c('.pizzaBig img').src = pizzaJson[key].img;
        c('.pizzaInfo--actualPrice').innerHTML = `R$ ${modalPrice.toFixed(2)}`;

        //iniciar com o tamanho grande (2) sempre selecionado
        cs('.pizzaInfo--size').forEach((size, sizeIndex)=>{
            size.classList.remove('selected')
            if(sizeIndex == 2){
                size.classList.add('selected')
            }

            size.querySelector('span').innerHTML = pizzaJson[key].sizes[sizeIndex];
        })

        //iniciar com 1 quantidade no carrinho
        c('.pizzaInfo--qt').innerHTML = modalQt;

        //animação do clique
        c(".pizzaWindowArea").style.display = 'flex';
        setTimeout(() => {
            c(".pizzaWindowArea").style.opacity = 1;
        }, 200);

        c('.pizzaInfo--qtmenos').style.opacity = 0.3;
    })

    c('.pizza-area').append(pizzaItem);
})

//eventos do MODAL

//fechar o modal
function closeModal(){
    c('.pizzaWindowArea').style.opacity = 0;
    setTimeout(()=>{
        c('.pizzaWindowArea').style.display = 'none'
    }, 500)
}
cs('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item)=>{
    item.addEventListener('click', closeModal)
})

//diminuir itens do carrinho
c('.pizzaInfo--qtmenos').addEventListener('click', ()=>{
    if(modalQt>1){
        modalQt--;
        c('.pizzaInfo--qt').innerHTML = modalQt;
        totalPrice = totalPrice - modalPrice;
        c('.pizzaInfo--actualPrice').innerHTML = `R$ ${totalPrice.toFixed(2)}`;
    };
    if(modalQt == 1){
        c('.pizzaInfo--qtmenos').style.opacity = 0.3;
    };
})
//adicionar itens ao carrinho
c('.pizzaInfo--qtmais').addEventListener('click', ()=>{
    modalQt++;
    totalPrice = 0;
    totalPrice+=modalPrice*modalQt;

    c('.pizzaInfo--qt').innerHTML = modalQt;
    
    c('.pizzaInfo--actualPrice').innerHTML = `R$ ${totalPrice.toFixed(2)}`;

    if(modalQt>1){
        c('.pizzaInfo--qtmenos').style.opacity = 1;
    }
})

//remover e adicionar a classe .selected
cs('.pizzaInfo--size').forEach((size, sizeIndex)=>{
    size.addEventListener('click', ()=>{
        c('.pizzaInfo--size.selected').classList.remove('selected');
        size.classList.add('selected');
        modalPrice = pizzaJson[modalKey].price[sizeIndex];
        modalQt = 1;

        c('.pizzaInfo--qt').innerHTML = modalQt;
        c('.pizzaInfo--actualPrice').innerHTML = `R$ ${modalPrice.toFixed(2)}`;
    })
})

//salvar itens adicionados ao carrinho
c('.pizzaInfo--addButton').addEventListener('click', ()=>{
    let size = parseInt(c('.pizzaInfo--size.selected').getAttribute('data-key'));

    let identifier = pizzaJson[modalKey].id+'@'+size;

    //retorna o index do cart.identifier se for igual, e -1 se nao existir
    let key = cart.findIndex((item)=>item.identifier == identifier);   

    if(key > -1){
        cart[key].qt += modalQt;
    }else{
        cart.push({
            identifier,
            id:pizzaJson[modalKey].id,
            size,
            qt:modalQt
        })
    }
    closeModal();
    updateCart(); //chamar funçao para abrir o carrinho
})

c('.menu-openner').addEventListener('click', () =>{
    if(cart.length>0){
        c('aside').style.left = 0;
    }else{
        c('aside').style.left = '100vw';
    }
});
c('.menu-closer').addEventListener('click', () =>{
    c('aside').style.left = '100vw';
})

//abrindo o carrinho de compras
function updateCart(){
    c('.menu-openner span').innerHTML = cart.length;
    if(cart.length > 0){
        c('aside').classList.add('show');
        c('.cart').innerHTML = '';

        let total = 0;
        let subtotal = 0;
        let desconto = 0;

        for(let i in cart){
            
            
            let pizzaItem = pizzaJson.find((item)=>item.id == cart[i].id);
            let cartItem = c('.models .cart--item').cloneNode(true);
            subtotal += pizzaItem.price[cart[i].size] * cart[i].qt;
            let pizzaSizeName;
            switch(cart[i].size){
                case 0:
                    pizzaSizeName = 'P';
                    break;
                case 1:
                    pizzaSizeName = 'M';
                    break;
                case 2:
                    pizzaSizeName = 'G';
                    break;
            }
            let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`

            cartItem.querySelector('img').src = pizzaItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;

            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', ()=>{
                if(cart[i].qt>1){
                    cart[i].qt--;
                }else{
                    cart.splice(i, 1);  
                };
                updateCart();
            });

            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', ()=>{
                cart[i].qt++;
                updateCart();
            });

            c('.cart').append(cartItem);
        }
        desconto = subtotal * 0.1;
        total = subtotal - desconto;

        cs('.cart--totalitem.subtotal span')[1].innerHTML = subtotal.toFixed(2);
        c('.cart--totalitem.desconto span:last-child').innerHTML = desconto.toFixed(2);
        cs('.cart--totalitem.total.big span')[1].innerHTML = total.toFixed(2);   

    }else{
        c('aside').classList.remove('show');
        c('aside').style.left = '100vw';
    }
}

//buscando a pizza
let field = document.querySelector('.input-search')

field.addEventListener('keyup', (e)=>{
    let inputValue = e.target.value;
    let textCard = document.querySelectorAll('.pizza-item--name');
    Array.from(textCard).map((array)=>{
        let index = array.innerText;
        let divDisplay = array.closest(".pizza-item")

        if(index.toLowerCase().includes(inputValue.toLowerCase())){
            divDisplay.style.display = 'block'
        }else{
            divDisplay.style.display = 'none'
        }
   })
})














