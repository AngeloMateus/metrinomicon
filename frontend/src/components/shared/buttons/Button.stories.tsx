import type { Meta, StoryObj } from "@storybook/react";
import "../../../css/globals.css";
import { Button } from "./button";

const meta = {
  component: Button,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: "Button Label",
    onClick: () => {},
    display: { type: "primary", className: "px-2" },
  },
  render: args => (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-4 h-screen w-32 justify-center items-center bg-admin-bg-dark">
        <Button {...args} display={{ ...args.display, size: "lg" }} />
        <Button {...args} display={{ ...args.display, size: "md" }} />
        <Button {...args} display={{ ...args.display, size: "sm" }} />
      </div>
      <div className="flex flex-col gap-4 h-screen w-32 justify-center items-center bg-admin-bg-dark">
        <Button {...args} loading={true} display={{ ...args.display, size: "lg" }} />
        <Button {...args} loading={true} display={{ ...args.display, size: "md" }} />
        <Button {...args} loading={true} display={{ ...args.display, size: "sm" }} />
      </div>
    </div>
  ),
};

export const Secondary: Story = {
  args: {
    label: "Button Label",
    onClick: () => {},
    display: { type: "secondary", className: "px-2" },
  },
  render: args => (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-4 h-screen w-32 justify-center items-center bg-admin-bg-dark">
        <Button {...args} display={{ ...args.display, size: "lg" }} />
        <Button {...args} display={{ ...args.display, size: "md" }} />
        <Button {...args} display={{ ...args.display, size: "sm" }} />
      </div>
      <div className="flex flex-col gap-4 h-screen w-32 justify-center items-center bg-admin-bg-dark">
        <Button {...args} loading={true} display={{ ...args.display, size: "lg" }} />
        <Button {...args} loading={true} display={{ ...args.display, size: "md" }} />
        <Button {...args} loading={true} display={{ ...args.display, size: "sm" }} />
      </div>
    </div>
  ),
};
