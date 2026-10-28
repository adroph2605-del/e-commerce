CREATE DATABASE IF NOT EXISTS soko_next CHARACTER SET utf8mb4;
USE soko_next;
CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL UNIQUE,
 password VARCHAR(255) NOT NULL, role ENUM('customer','seller','admin') DEFAULT 'customer', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE stores(id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL UNIQUE, name VARCHAR(120) NOT NULL,
 status ENUM('Pending','Active','Suspended','Rejected') DEFAULT 'Pending', commission DECIMAL(4,1) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE settings(k VARCHAR(40) PRIMARY KEY, v VARCHAR(100));
INSERT INTO settings VALUES('commission','10');
CREATE TABLE categories(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) NOT NULL, slug VARCHAR(80) NOT NULL UNIQUE);
CREATE TABLE products(id INT AUTO_INCREMENT PRIMARY KEY, category_id INT, vendor_id INT NULL, name VARCHAR(150) NOT NULL,
 description TEXT, price DECIMAL(12,2) NOT NULL, stock INT DEFAULT 0, image VARCHAR(255), rating DECIMAL(2,1) DEFAULT 4.5,
 badge VARCHAR(30), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL, FOREIGN KEY(vendor_id) REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE orders(id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NULL, subtotal DECIMAL(12,2), discount DECIMAL(12,2) DEFAULT 0,
 tax DECIMAL(12,2), shipping DECIMAL(12,2), total DECIMAL(12,2), currency VARCHAR(5) DEFAULT 'TZS', payment_method VARCHAR(30),
 address VARCHAR(255), status ENUM('Pending','Processing','Shipped','Delivered','Refunded') DEFAULT 'Pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE order_items(id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, product_id INT, name VARCHAR(150), price DECIMAL(12,2), qty INT NOT NULL, vendor_id INT NULL, commission DECIMAL(12,2) DEFAULT 0,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE, FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL);
INSERT INTO categories(name,slug) VALUES('Electronics','electronics'),('Home & Living','home'),('Fashion','fashion'),('Business Supplies','business');
INSERT INTO products(category_id,name,description,price,stock,image,rating,badge) VALUES
(1,'Pro Laptop 15"','Fast, light laptop for work and study.',2450000,25,'/assets/images/img6.jpg',4.8,'Hot'),
(1,'Smartphone X','Dual SIM, 5G, all-day battery.',980000,60,'/assets/images/img3.jpg',4.6,'New'),
(2,'Mustard Sofa 3-Seater','Soft fabric, solid wood legs.',1350000,8,'/assets/images/img6.jpg',4.7,'-15%'),
(4,'Shipping Boxes (50 pack)','Strong cardboard boxes for sellers.',85000,300,'/assets/images/img4.jpg',4.5,'Bulk'),
(4,'Starter Seller Kit','Boxes, tape, labels and bags.',120000,120,'/assets/images/img1.jpg',4.4,'Deal'),
(3,'Rainbow Socks (6 pairs)','Colourful cotton socks.',35000,200,'/assets/images/img2.jpg',4.9,'Top');
