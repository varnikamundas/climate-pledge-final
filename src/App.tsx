import React, { useState, useEffect } from 'react';
import './styles.css';
import html2canvas from 'html2canvas';

type ProfileType = 'Student' | 'Working Professional' | 'Workshops' | 'Other';
type CommitmentTheme = 'Energy' | 'Transportation' | 'Consumption';

interface Pledge {
    _id?: string; // MongoDB ID
    name: string;
    email: string;
    mobile: string;
    state: string;
    profileType: ProfileType;
    commitments: CommitmentTheme[];
    date: string;
}

const commitmentOptions: Record<CommitmentTheme, string[]> = {
    Energy: [
        "Turn off lights when not in use",
        "Use energy-efficient appliances",
        "Set thermostat 1°C higher in summer"
    ],
    Transportation: [
        "Walk or bike for short trips",
        "Use public transport at least once a week",
        "Carpool when possible"
    ],
    Consumption: [
        "Reduce single-use plastics",
        "Buy local and seasonal produce",
        "Repair instead of replace when possible"
    ]
};

// Function to format date as DD-MM-YYYY
const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const App: React.FC = () => {
    const [pledges, setPledges] = useState<Pledge[]>([]);
    const [formData, setFormData] = useState<Omit<Pledge, '_id' | 'date'>>({
        name: '',
        email: '',
        mobile: '',
        state: '',
        profileType: 'Student',
        commitments: []
    });
    const [submitted, setSubmitted] = useState(false);
    const [selectedCommitments, setSelectedCommitments] = useState<Record<string, boolean>>({});
    const [targetPledges] = useState(1000000);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Fetch pledges from backend
    useEffect(() => {
        fetch('http://localhost:5000/pledges')
            .then(res => res.json())
            .then(data => setPledges(data))
            .catch(err => console.error('Error fetching pledges:', err));
    }, []);

    // Update progress percentage
    useEffect(() => {
        const percentage = (pledges.length / targetPledges) * 100;
        setProgressPercentage(percentage > 100 ? 100 : percentage);
    }, [pledges, targetPledges]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCommitmentChange = (theme: CommitmentTheme, option: string) => {
        const key = `${theme}-${option}`;
        setSelectedCommitments(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const commitments = Object.entries(selectedCommitments)
            .filter(([_, isSelected]) => isSelected)
            .map(([key]) => key.split('-')[0] as CommitmentTheme)
            .filter((value, index, self) => self.indexOf(value) === index);

        const newPledge: Pledge = {
            ...formData,
            commitments,
            date: formatDate(new Date())
        };

        // POST to backend
        fetch('http://localhost:5000/pledges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPledge)
        })
            .then(res => res.json())
            .then(savedPledge => {
                setPledges(prev => [...prev, savedPledge]);
                setSubmitted(true);
                setIsAnimating(true);

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    mobile: '',
                    state: '',
                    profileType: 'Student',
                    commitments: []
                });
                setSelectedCommitments({});

                // Stop animation after 2 seconds
                setTimeout(() => setIsAnimating(false), 2000);
            })
            .catch(err => console.error('Error submitting pledge:', err));
    };

    const countByProfileType = (type: ProfileType) => pledges.filter(p => p.profileType === type).length;

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    const downloadCertificate = () => {
        const certificate = document.getElementById('certificate');
        if (certificate) {
            html2canvas(certificate).then(canvas => {
                const link = document.createElement('a');
                link.download = `climate-pledge-${pledges[pledges.length - 1].name}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const shareCertificate = async () => {
        const certificate = document.getElementById('certificate');
        if (certificate) {
            try {
                const canvas = await html2canvas(certificate);
                const dataUrl = canvas.toDataURL('image/png');
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'pledge.png', { type: blob.type });

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'My Climate Pledge',
                        text: `I've taken the climate pledge! Join me in making a difference.`,
                        files: [file]
                    });
                } else {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = `climate-pledge-${pledges[pledges.length - 1].name}.png`;
                    link.click();
                }
            } catch (err) {
                console.error('Error sharing:', err);
                downloadCertificate(); // fallback
            }
        }
    };

    return (
        <div className="app">
            {/* Hero Section */}
            <section className="hero">
                <div className="windmill"><div className="tower"></div><div className="blades"></div></div>
                <div className="hero-content">
                    <h1>Join the Climate Action Movement</h1>
                    <p>Your small actions create big change. Take the pledge today!</p>
                    <button className="cta-button" onClick={() => scrollTo('pledge-form')}>Take the Pledge</button>
                </div>
            </section>

            {/* KPIs */}
            <section className="kpis">
                <div className="kpi-container">
                    <div className="kpi-card"><h2>Target Pledges</h2><p className="kpi-value">1,000,000</p></div>
                    <div className="kpi-card"><h2>Achieved Pledges</h2><p className="kpi-value">{pledges.length}</p></div>
                    <div className="kpi-card"><h2>Students</h2><p className="kpi-value">{countByProfileType('Student')}</p></div>
                    <div className="kpi-card"><h2>Working Professionals</h2><p className="kpi-value">{countByProfileType('Working Professional')}</p></div>
                    <div className="kpi-card"><h2>Workshops</h2><p className="kpi-value">{countByProfileType('Workshops')}</p></div>
                </div>
            </section>

            {/* Community Impact */}
            <section className="community-impact">
                <h2>Live Community Impact</h2>
                <div className="progress-container">
                    <div className="progress-label">
                        <span>Progress to 1M pledges</span>
                        <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className={`progress-fill ${isAnimating ? 'animate' : ''}`} style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </section>

            {/* Pledge Form */}
            <section id="pledge-form" className="pledge-form">
                <h2>Make Your Climate Pledge</h2>
                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group"><label>Full Name*</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required/></div>
                        <div className="form-group"><label>Email*</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} required/></div>
                        <div className="form-group"><label>Mobile*</label><input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} required/></div>
                        <div className="form-group"><label>State</label><input type="text" name="state" value={formData.state} onChange={handleInputChange}/></div>

                        <div className="form-group">
                            <label>Profile Type</label>
                            <div className="radio-group">
                                {(['Student','Working Professional','Workshops','Other'] as ProfileType[]).map(type => (
                                    <label key={type}><input type="radio" name="profileType" value={type} checked={formData.profileType===type} onChange={handleInputChange}/>{type}</label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Select Your Commitments</label>
                            <div className="commitments-container">
                                {Object.entries(commitmentOptions).map(([theme, options]) => (
                                    <div key={theme} className="commitment-theme">
                                        <h3>{theme}</h3>
                                        {options.map(option => (
                                            <label key={option} className="commitment-option">
                                                <input type="checkbox" checked={selectedCommitments[`${theme}-${option}`]||false} onChange={()=>handleCommitmentChange(theme as CommitmentTheme, option)}/>
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="submit-button">Submit Pledge</button>
                    </form>
                ) : (
                    <div className="certificate-section">
                        <div id="certificate" className="certificate">
                            <h3>Certificate of Climate Commitment</h3>
                            <h4>Presented to</h4>
                            <h2>{pledges[pledges.length-1].name}</h2>
                            <p>For being</p>
                            <h3>"Cool Enough to Care!"</h3>
                            <div className="hearts-rating">{'❤️'.repeat(pledges[pledges.length-1].commitments.length)}</div>
                            <p className="certificate-date">Pledged on: {formatDate(new Date())}</p>
                        </div>
                        <div className="certificate-actions">
                            <button className="cta-button" onClick={downloadCertificate}>Download Certificate</button>
                            <button className="cta-button share-button" onClick={shareCertificate}>Share Certificate</button>
                            <button className="cta-button" onClick={()=>{setSubmitted(false); scrollTo('pledge-wall');}}>View Pledge Wall</button>
                        </div>
                    </div>
                )}
            </section>

            {/* Pledge Wall */}
            <section id="pledge-wall" className="pledge-wall">
                <h2>PLEDGE WALL</h2>
                <div className="table-container">
                    <table>
                        <thead>
                        <tr><th>Name</th><th>Date</th><th>State</th><th>Profile</th><th>Love for Planet</th></tr>
                        </thead>
                        <tbody>
                        {pledges.map(p => (
                            <tr key={p._id || p.name}>
                                <td data-label="Name">{p.name}</td>
                                <td data-label="Date">{p.date}</td>
                                <td data-label="State">{p.state}</td>
                                <td data-label="Profile">{p.profileType}</td>
                                <td data-label="Love for Planet">{'❤️'.repeat(p.commitments.length)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <footer>
                <p>© {new Date().getFullYear()} Climate Action Pledge. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default App;
