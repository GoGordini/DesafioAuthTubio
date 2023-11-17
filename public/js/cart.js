const addToCart = (_id) => {
    const amount = {"quantity":1};
    fetch(`/api/carts/6545642cca55f5b5ab6ea0d6/products/${_id}`, {
    method: 'PUT',
    body: JSON.stringify(amount),
    headers: {
        'Content-Type': 'application/json'
    }
}).then(result => result.json()).then(json => console.log(json))
    console.log("Agregado");
}