"use client";

import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, clearCart, toggleCart, getTotal } =
    useCartStore();

  const total = getTotal();

  const whatsappOrderMessage = items
    .map(
      (item) =>
        `• ${item.product.name} (${item.product.size}) x${item.quantity} = Rs ${((item.product.salePrice || item.product.price) * item.quantity).toLocaleString()}`
    )
    .join("\n");

  const whatsappLink = `https://wa.me/9779840036888?text=${encodeURIComponent(
    `Hi! I'd like to place an order:\n\n${whatsappOrderMessage}\n\nTotal: Rs ${total.toLocaleString()}\n\nPlease confirm availability and delivery.`
  )}`;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={toggleCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#6FB644]" />
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
              <p className="text-gray-400 text-sm mb-6">
                Add some beautiful plants to get started!
              </p>
              <button
                onClick={toggleCart}
                className="bg-[#6FB644] text-white px-6 py-2 rounded-full hover:bg-[#5a9636] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.product.salePrice || item.product.price;
                return (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-100">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize">
                        {item.product.size}
                      </p>
                      <p className="text-sm font-bold text-[#6FB644] mt-1">
                        Rs {price.toLocaleString()}
                      </p>

                      <div className="flex items-center mt-2">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            className="p-1.5 hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1
                              )
                            }
                            className="p-1.5 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Subtotal:</span>
              <span className="text-[#6FB644]">
                Rs {total.toLocaleString()}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={toggleCart}
              className="block w-full text-center bg-[#6FB644] text-white py-3 rounded-lg font-semibold hover:bg-[#5a9636] transition-colors"
            >
              Checkout
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-semibold hover:bg-[#1da851] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Order via WhatsApp
            </a>

            <button
              onClick={clearCart}
              className="w-full text-center text-gray-500 text-sm hover:text-red-500 transition-colors py-1"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
