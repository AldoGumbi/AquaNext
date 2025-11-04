import { readFileSync } from 'fs';
const ALLproductos = JSON.parse(readFileSync('./productos.json', 'utf-8'));


let i = 0;
for(const producto of ALLproductos.data) {
  const obj = {
    general : {
      sku : producto.sku,
      name : producto.nombre,
      price : producto.precio_venta,
      category_id : producto.categoria,
      cost : producto.costo,
      is_avaliable : producto.is_avaliable ?? true,
    },
    description : {
      description : producto.descripcion,
    },
    images : {
      cover : producto.imagen,
    },
    inventory  : {
      stock : 0,
      minimum_stock : 10,
      maximum_stock : 300,
    }
  }
  fetch('http://localhost:3000/products/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  })
  .then(response => response.json())
  .then(data => {
    console.log(producto.nombre);
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  i++;
}
