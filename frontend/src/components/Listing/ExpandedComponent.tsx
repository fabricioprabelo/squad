export interface ExpandedComponentProps<T = any> {
  data?: T;
  children?: React.ReactNode;
}

export default function ExpandedComponent<T = any>(props: ExpandedComponentProps<T>): React.ReactElement {
  return <>{props.children}</>;
};
