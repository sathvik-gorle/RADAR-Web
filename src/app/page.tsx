import SiteHeader from "@/components/site-header";
import {HeroSection} from "@/components/hero-section";
import {LogoTicker} from "@/components/logo-ticker";
import SiteFooter from "@/components/site-footer";
import {CallToAction} from "@/components/call-to-action";

export default function Home() {
    return (
        <>
            <SiteHeader />
            <HeroSection />
            <LogoTicker />
            <CallToAction />
            <SiteFooter />
        </>
    );
}
