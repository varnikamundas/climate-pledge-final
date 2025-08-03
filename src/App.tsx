import React, { useState, useEffect } from 'react';
import './styles.css';

type ProfileType = 'Student' | 'Working Professional' | 'Other';
type CommitmentTheme = 'Energy' | 'Transportation' | 'Consumption';

interface Pledge {
    id: string;
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

const App: React.FC = () => {
    const [pledges, setPledges] = useState<Pledge[]>([]);
    const [formData, setFormData] = useState<Omit<Pledge, 'id' | 'date'>>({
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

    // Simulate loading pledges
    useEffect(() => {
        const mockPledges: Pledge[] = [
            {
                id: '1',
                name: 'Janice',
                email: 'janice@example.com',
                mobile: '1234567890',
                state: 'maharashtra',
                profileType: 'Working Professional',
                commitments: ['Energy', 'Transportation'],
                date: '2023-05-15'
            },
            {
                id: '2',
                name: 'John Smith',
                email: 'john@example.com',
                mobile: '0987654321',
                state: 'New Delhi',
                profileType: 'Student',
                commitments: ['Consumption'],
                date: '2023-05-16'
            }
        ];
        setPledges(mockPledges);
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
            id: `pledge-${Date.now()}`,
            date: new Date().toISOString().split('T')[0]
        };

        setPledges(prev => [...prev, newPledge]);
        setSubmitted(true);

        setFormData(prev => ({
            name: '',
            email: '',
            mobile: '',
            state: '',
            profileType: prev.profileType,
            commitments: []
        }));
        setSelectedCommitments({});
    };

    const countByProfileType = (type: ProfileType) => {
        return pledges.filter(p => p.profileType === type).length;
    };

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="app">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Join the Climate Action Movement</h1>
                    <p>Your small actions create big change. Take the pledge today!</p>
                    <button className="cta-button" onClick={() => scrollTo('pledge-form')}>
                        Take the Pledge
                    </button>
                </div>
            </section>

            {/* Live KPIs */}
            <section className="kpis">
                <div className="kpi-container">
                    <div className="kpi-card">
                        <h2>Target Pledges</h2>
                        <p className="kpi-value">1,000,000</p>
                    </div>
                    <div className="kpi-card">
                        <h2>Achieved Pledges</h2>
                        <p className="kpi-value">{pledges.length}</p>
                    </div>
                    <div className="kpi-card">
                        <h2>Students</h2>
                        <p className="kpi-value">{countByProfileType('Student')}</p>
                    </div>
                    <div className="kpi-card">
                        <h2>Working Professionals</h2>
                        <p className="kpi-value">{countByProfileType('Working Professional')}</p>
                    </div>
                    <div className="kpi-card">
                        <h2>Workshops</h2>
                        <p className="kpi-value">0</p>
                    </div>
                </div>
            </section>

            {/* Community Impact */}
            <section className="community-impact">
                <h2>Live Community Impact</h2>
                <p>See how our community is growing and making a difference</p>

                <div className="progress-container">
                    <div className="progress-label">
                        <span>Progress to 1M pledges</span>
                        <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </section>

            {/* Why Take Climate Action */}
            <section className="impact-statement">
                <h2>Why Your Action Matters</h2>
                <p>
                    Climate change is a global challenge, but the solution starts with individual actions.
                    When we all make small changes in our daily lives, we create a powerful collective impact
                    that can drive systemic change. Your pledge today inspires others and contributes to a
                    growing movement for a sustainable future.
                </p>
            </section>

            {/* Pledge Form */}
            <section id="pledge-form" className="pledge-form">
                <h2>Make Your Climate Pledge</h2>
                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name*</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email*</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobile">Mobile Number*</label>
                            <input
                                type="tel"
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                required
                            />
                            <small className="privacy-note">
                                Mobile Number is required for validation but never shown publicly.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Profile Type</label>
                            <div className="radio-group">
                                {(['Student', 'Working Professional', 'Other'] as ProfileType[]).map(type => (
                                    <label key={type}>
                                        <input
                                            type="radio"
                                            name="profileType"
                                            value={type}
                                            checked={formData.profileType === type}
                                            onChange={handleInputChange}
                                        />
                                        {type}
                                    </label>
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
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCommitments[`${theme}-${option}`] || false}
                                                    onChange={() => handleCommitmentChange(theme as CommitmentTheme, option)}
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="privacy-note">
                            <p>
                                <strong>Privacy Note:</strong> Mobile Number and Email are required for validation but never shown publicly.
                                Date is used only for verification and engagement.
                            </p>
                        </div>

                        <button type="submit" className="submit-button">
                            Submit Pledge
                        </button>
                    </form>
                ) : (
                    <div className="certificate-section">
                        <div className="certificate">
                            <h3>Certificate of Climate Commitment</h3>
                            <h4>Presented to</h4>
                            <h2>{pledges[pledges.length - 1].name}</h2>
                            <p>For being</p>
                            <h3>"Cool Enough to Care!"</h3>
                            <div className="hearts-rating">
                                {'❤️'.repeat(pledges[pledges.length - 1].commitments.length)}
                            </div>
                            <p className="certificate-date">
                                Pledged on: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            className="cta-button"
                            onClick={() => {
                                setSubmitted(false);
                                scrollTo('pledge-wall');
                            }}
                        >
                            View Pledge Wall
                        </button>
                    </div>
                )}
            </section>

            {/* Public Pledge Wall */}
            <section id="pledge-wall" className="pledge-wall">
                <h2>Our Climate Heroes</h2>
                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Pledge ID</th>
                            <th>Name</th>
                            <th>Date</th>
                            <th>State</th>
                            <th>Profile</th>
                            <th>Love for Planet</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pledges.map(pledge => (
                            <tr key={pledge.id}>
                                <td>{pledge.id.slice(0, 8)}...</td>
                                <td>{pledge.name}</td>
                                <td>{pledge.date}</td>
                                <td>{pledge.state}</td>
                                <td>{pledge.profileType}</td>
                                <td>{'❤️'.repeat(pledge.commitments.length)}</td>
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