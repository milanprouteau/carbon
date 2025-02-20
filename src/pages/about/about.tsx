import React from 'react';
import './about.scss';
import carbonFootprintDiagram from '../../assets/carbon-footprint-diagram.jpg';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <section className="hero-section">
        <h1>Understanding Carbon Footprint & Environmental Impact</h1>
        <p className="lead">Discover how our daily choices affect climate change and learn about sustainable solutions for a greener future.</p>
      </section>

      <section className="content-section">
        <h2>What is Carbon Footprint?</h2>
        <div className="image-text-container">
          <img 
            src={carbonFootprintDiagram}
            alt="Carbon footprint diagram showing various sources of emissions" 
            className="section-image"
          />
          <p>
            A carbon footprint represents the total amount of greenhouse gases (primarily carbon dioxide) 
            that our actions generate. This includes both direct emissions from activities like driving 
            cars and indirect emissions from the products we use and the services we consume.
          </p>
        </div>

        <h2>Major Contributors to Carbon Emissions</h2>
        <div className="grid-container">
          <div className="grid-item">
            <h3>Transportation</h3>
            <p>
              Transportation accounts for approximately 29% of global carbon emissions. This includes:
              <ul>
                <li>Personal vehicle usage</li>
                <li>Air travel</li>
                <li>Public transportation</li>
                <li>Shipping and logistics</li>
              </ul>
            </p>
          </div>

          <div className="grid-item">
            <h3>Energy Consumption</h3>
            <p>
              Household and industrial energy use contributes to about 25% of global emissions through:
              <ul>
                <li>Electricity generation</li>
                <li>Heating and cooling</li>
                <li>Industrial processes</li>
                <li>Building operations</li>
              </ul>
            </p>
          </div>

          <div className="grid-item">
            <h3>Food and Agriculture</h3>
            <p>
              Agricultural activities represent 24% of global emissions, including:
              <ul>
                <li>Livestock farming</li>
                <li>Deforestation</li>
                <li>Food waste</li>
                <li>Agricultural practices</li>
              </ul>
            </p>
          </div>
        </div>

        <h2>Impact on Climate Change</h2>
        <div className="image-text-container">
          <img 
            src={carbonFootprintDiagram}
            alt="Visual representation of climate change impacts" 
            className="section-image"
          />
          <p>
            The accumulation of greenhouse gases in our atmosphere leads to:
            <ul>
              <li>Rising global temperatures</li>
              <li>Extreme weather events</li>
              <li>Sea level rise</li>
              <li>Biodiversity loss</li>
              <li>Food security challenges</li>
            </ul>
          </p>
        </div>

        <h2>Measuring and Reducing Your Carbon Footprint</h2>
        <p>
          Understanding and measuring your carbon footprint is the first step toward reduction. 
          Key areas for personal impact include:
        </p>
        <div className="action-steps">
          <div className="action-item">
            <h4>Transportation Choices</h4>
            <p>Opt for public transport, electric vehicles, or carbon-neutral travel options.</p>
          </div>
          <div className="action-item">
            <h4>Energy Efficiency</h4>
            <p>Use renewable energy sources and energy-efficient appliances.</p>
          </div>
          <div className="action-item">
            <h4>Consumption Habits</h4>
            <p>Choose sustainable products and reduce waste through recycling and reuse.</p>
          </div>
        </div>

        <h2>Global Initiatives and Solutions</h2>
        <p>
          Worldwide efforts to combat climate change include:
          <ul>
            <li>The Paris Agreement's goal to limit global temperature rise</li>
            <li>Carbon pricing and emissions trading systems</li>
            <li>Investment in renewable energy technologies</li>
            <li>Forest conservation and reforestation projects</li>
          </ul>
        </p>
      </section>
    </div>
  );
};

export default About;
