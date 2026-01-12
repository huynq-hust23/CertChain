"use client";
import React from "react";
import Logo from "./Logo";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import { TbCertificate } from "react-icons/tb";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePhantomWallet } from "@/lib/phantom-wallet";
import { FaSpinner } from "react-icons/fa";

export default function NavBar() {
  const { publicKey, isConnecting, isInstalled, connect, disconnect, isLoading } =
    usePhantomWallet();

  const shortKey = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : null;

  async function onPhantomClick() {
    if (!isInstalled) {
      window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
      return;
    }

    if (publicKey) {
      await disconnect();
      return;
    }

    await connect();
  }

  return (
    <nav className="flex justify-end sm:justify-between items-center border-b border-border h-[60px] px-4 py-2">
      <Logo />
      <div className="w-fit h-full flex justify-center items-stretch">
        {(isLoading || isConnecting) ? (
          <Button
            type="button"
            className="w-16 h-auto rounded-[5px] text-sm ms-2 px-4 flex items-center justify-center pointer-events-none"
            variant={"secondary"}
          >
            <FaSpinner className="animate-spin text-lg" />
          </Button>
        ) : publicKey ? (
          <div className="flex items-center gap-2">
            <div className="bg-secondary px-4 py-2 rounded-[5px] text-sm">
              {shortKey}
            </div>
            <Button
              type="button"
              className="w-fit h-auto rounded-[5px] text-sm px-4 bg-red-500 hover:bg-red-600 text-white"
              onClick={onPhantomClick}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            className="w-fit h-auto rounded-[5px] text-sm ms-2 px-4"
            variant={"secondary"}
            onClick={onPhantomClick}
          >
            {isInstalled ? "Login Phantom" : "Install Phantom"}
          </Button>
        )}
        <Button
          asChild
          className="w-fit h-auto rounded-[5px] text-xl ms-2 px-6"
          variant={"secondary"}
        >
          <Link href={"/create-certificate"}>
            <MdOutlineCreateNewFolder className="w-full h-full" />
          </Link>
        </Button>
        <Button
          asChild
          className="w-fit h-auto rounded-[5px] text-xl ms-2 px-6"
          variant={"secondary"}
        >
          <Link href={"/get-certificate"}>
            <TbCertificate className="w-full h-[90%]" />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
