import { readFileSync } from 'fs';
const ALLproductos = JSON.parse(readFileSync('./s.json', 'utf-8'));


let i = 0;
for(const producto of ALLproductos.data) {
  console.log(i);
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
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  i++;

}
