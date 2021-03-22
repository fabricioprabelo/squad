import { ExpandedComponentProps } from "./ExpandedComponent";

export default function ExpandedComponent<T = any>(props: ExpandedComponentProps<T>): React.ReactElement {
  return <>{props.children}</>;
};
