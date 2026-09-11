import { Link } from "react-router-dom";

/**
 * Generic button. Renders a <Link> when `to` is passed, otherwise a <button>.
 * variant: primary | outline | dark | ghost
 */
export default function Button({
  children,
  variant = "primary",
  size,
  to,
  block,
  icon,
  className = "",
  ...rest
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
