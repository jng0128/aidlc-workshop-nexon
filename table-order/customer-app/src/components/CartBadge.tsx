import { useCartStore } from '../stores/cartStore';

function CartBadge() {
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const count = getTotalItems();

  if (count === 0) return null;

  return (
    <span
      style={{
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        backgroundColor: '#ef4444',
        color: '#fff',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        fontSize: '11px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default CartBadge;
