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
        <footer className="flex flex-row justify-center p-5">
            <p className="leading-7 [&:not(:first-child)]:mt-6 mr-2">Eitan Amzallag</p>
            <LinkedInButton />
        </footer>
    );
}