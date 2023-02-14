import Link from 'next/link';

export interface IHeader extends React.ComponentPropsWithoutRef<'header'> {}

const Header: React.FC<IHeader> = ({ className, ...headerProps }) => {
  return (
    <header {...headerProps}>
      <div>
        <Link href="/">Home</Link>
      </div>
    </header>
  );
};

export default Header;
