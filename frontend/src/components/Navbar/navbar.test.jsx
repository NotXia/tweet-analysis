import '@testing-library/jest-dom';
import { render, screen, waitFor } from "@testing-library/react";
import Navbar from "./index";
import { BrowserRouter } from 'react-router-dom';


describe("Test navbar", function () {
    test("Verifica collegamenti", async function () {
        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect( await screen.findByText("Ricerca") ).toBeInTheDocument();
        expect( screen.getByText("Ricerca").closest("a") ).toHaveAttribute("href", "/");

        expect( await screen.findByText("La Ghigliottina") ).toBeInTheDocument();
        expect( screen.getByText("La Ghigliottina").closest("a") ).toHaveAttribute("href", "/ghigliottina");

        expect( await screen.findByText("Catena Finale") ).toBeInTheDocument();
        expect( screen.getByText("Catena Finale").closest("a") ).toHaveAttribute("href", "/catenafinale");

        expect( await screen.findByText("Scacchi") ).toBeInTheDocument();
        expect( screen.getByText("Scacchi").closest("a") ).toHaveAttribute("href", "/chess");
    });
});