import { FaLinkedin } from "react-icons/fa";

export function LinkedInButton() {
    return (
        <a
            href="https://www.linkedin.com/in/eitan-amzallag/"
            target="_blank"
            rel="noopener noreferrer"
        >
            <FaLinkedin size={20} />
        </a>
    );
}

export default function Footer() {
    return(
        <footer className="flex shrink-0 flex-row items-center justify-center px-4 py-3 text-sm md:p-5 md:text-base">
            <p className="mr-2 leading-7">Eitan Amzallag</p>
            <LinkedInButton />
        </footer>
    );
}
