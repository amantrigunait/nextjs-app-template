export interface IFooter extends React.ComponentPropsWithoutRef<'footer'> {}

const Footer: React.FC<IFooter> = ({ ...footerProps }) => {
  return (
    <footer {...footerProps}>
      <p>Canada</p>
    </footer>
  );
};

export default Footer;
